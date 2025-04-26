/**
 * @file src/background/index.ts
 *
 * @description
 * Service worker entry point for Check Mate. Handles all background processing:
 *
 * Key features & design notes
 * ────────────────────────────────────────────────────────────────────────────
 * • **Message handling** – Listens for "checkTweet" events from content script
 *   and orchestrates the fact-checking flow.
 * • **Claim extraction** – Uses `splitIntoClaims()` to break tweet text into
 *   individual factual assertions.
 * • **Parallel processing** – Runs up to 3 concurrent Sonar API requests for
 *   efficient fact-checking.
 * • **Storage management** – Persists analysis results to chrome.storage.session
 *   for popup access.
 * • **Error handling** – Gracefully handles API failures, malformed input, and
 *   other edge cases.
 *
 * @dependencies
 * • claims.ts: For tweet text segmentation
 * • sonar.ts: For Perplexity API integration
 * • verdict.ts: For final verdict computation
 * • chrome.storage: For persisting results
 * • chrome.runtime: For messaging
 */

import { splitIntoClaims } from "../common/claims";
import { callSonar } from "../common/sonar";
import { getVerdict } from "../common/verdict";
import type {
  AnalysisRequest,
  AnalysisResult,
  ClaimVerdict,
} from "../common/types";
import { getBadgeStatus, setGlobalBadge, initBadgeHandling } from "./badge";

/* -------------------------------------------------------------------------- */
/*                              Constants & Types                             */
/* -------------------------------------------------------------------------- */

/** Default confidence threshold for verdict computation. */
const DEFAULT_CONFIDENCE_THRESHOLD = 0.7;

/** Error subclass for background processing failures. */
class BackgroundError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "BackgroundError";
  }
}

/* -------------------------------------------------------------------------- */
/*                           Core helper functions                            */
/* -------------------------------------------------------------------------- */

/**
 * Retrieve the user's Perplexity API key from storage.
 *
 * @returns Promise resolving to the API key.
 * @throws {BackgroundError} If no key is found.
 */
async function getApiKey(): Promise<string> {
  const result = await chrome.storage.sync.get("apiKey");
  const apiKey = result.apiKey as string | undefined;
  if (!apiKey?.startsWith("sk-")) {
    throw new BackgroundError(
      "Please set your Perplexity API key in the extension options.",
    );
  }
  return apiKey;
}

/**
 * Retrieve the user's confidence threshold from storage.
 *
 * @returns Promise resolving to the threshold (0.5-0.9).
 */
async function getConfidenceThreshold(): Promise<number> {
  const { threshold } = await chrome.storage.sync.get("threshold");
  return typeof threshold === "number"
    ? Math.min(Math.max(threshold, 0.5), 0.9)
    : DEFAULT_CONFIDENCE_THRESHOLD;
}

/**
 * Store analysis results in chrome.storage.session for popup access.
 *
 * @param result - The analysis result to store.
 */
async function storeResult(result: AnalysisResult): Promise<void> {
  await chrome.storage.session.set({ lastResult: result });
}

/**
 * Send a completion message back to the content script.
 *
 * @param tabId - ID of the tab containing the content script.
 * @param success - Whether the analysis succeeded.
 */
async function notifyContentScript(
  tabId: number,
  success: boolean,
): Promise<void> {
  await chrome.tabs.sendMessage(tabId, {
    type: "analysisComplete",
    success,
  });
}

/* -------------------------------------------------------------------------- */
/*                           Main message handler                             */
/* -------------------------------------------------------------------------- */

/**
 * Process an incoming "checkTweet" message from the content script.
 *
 * @param request - The analysis request containing tweet text.
 * @param sender - Chrome message sender info.
 * @throws {BackgroundError} If processing fails.
 */
async function handleCheckTweet(
  request: AnalysisRequest,
  sender: chrome.runtime.MessageSender,
): Promise<void> {
  if (!sender.tab?.id) {
    throw new BackgroundError("Message must come from a tab");
  }

  try {
    // Get user settings
    const [apiKey, threshold] = await Promise.all([
      getApiKey(),
      getConfidenceThreshold(),
    ]);

    // Split tweet into claims
    const claims = splitIntoClaims(request.text);
    if (!claims.length) {
      throw new BackgroundError("No factual claims found in tweet");
    }

    // Process each claim in parallel (Sonar wrapper handles concurrency)
    const verdicts = await Promise.all(
      claims.map(async (claim): Promise<ClaimVerdict> => {
        try {
          const sonarResult = await callSonar(claim, apiKey);
          return {
            ...sonarResult,
            verdict: getVerdict(sonarResult, threshold),
          };
        } catch (err) {
          console.error("Failed to process claim:", claim, err);
          return {
            claim,
            verdict: "unclear",
            explanation: "Failed to fact-check this claim",
            citations: [],
            confidence: 0,
          };
        }
      }),
    );

    // Store result and notify content script
    const result: AnalysisResult = {
      tweetId: request.tweetId,
      text: request.text,
      claims,
      verdicts,
    };

    await Promise.all([
      storeResult(result),
      notifyContentScript(sender.tab.id, true),
      setGlobalBadge(getBadgeStatus(verdicts.map((v) => v.verdict))),
    ]);
  } catch (err) {
    console.error("Tweet analysis failed:", err);
    if (sender.tab?.id) {
      await notifyContentScript(sender.tab.id, false);
    }
    throw err; // Re-throw for chrome.runtime error handling
  }
}

/* -------------------------------------------------------------------------- */
/*                            Message listener setup                          */
/* -------------------------------------------------------------------------- */

/**
 * Register message handler for content script communication.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const msg = message as { type?: string } | undefined;
  if (msg?.type !== "checkTweet") {
    return false; // Not our message
  }

  // Process the request asynchronously
  handleCheckTweet(message as AnalysisRequest, sender).catch((err) => {
    console.error("Background error:", err);
    const error = err as Error;
    sendResponse({ error: error.message });
  });

  return true; // We'll call sendResponse asynchronously
});

// Initialize badge handling
initBadgeHandling();
