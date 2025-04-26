/**
 * @file src/common/sonar.ts
 *
 * @description
 * Wrapper around the Perplexity Sonar API that provides fact-checking services
 * for Check Mate. The module handles all network communication with Sonar,
 * including:
 *
 * Key features & design notes
 * ────────────────────────────────────────────────────────────────────────────
 * • **Automatic retries** – Failed requests are retried up to 3 times with
 *   exponential backoff (1s → 2s → 4s) to handle transient API issues.
 * • **Concurrency limit** – No more than 3 requests run simultaneously to
 *   avoid overwhelming the API and stay within rate limits.
 * • **Error resilience** – Network failures, timeouts, and malformed responses
 *   are caught and transformed into user-friendly `ClaimVerdict` objects.
 * • **Type safety** – Full TypeScript coverage with runtime validation of API
 *   responses to catch schema changes early.
 *
 * @dependencies
 * • p-limit: Enforces the 3-request concurrency cap
 * • p-retry: Handles exponential backoff retry logic
 *
 * @notes
 * • The module is designed to be used only by the background service worker,
 *   not directly from content scripts or the popup.
 * • API key is required and must be set via Options page before first use.
 */

import pLimit from "p-limit";
import pRetry from "p-retry";
import type { ClaimVerdict, Citation } from "./types";

/* -------------------------------------------------------------------------- */
/*                              Constants & Types                             */
/* -------------------------------------------------------------------------- */

/** Base URL for all Perplexity Sonar API requests. */
const PERPLEXITY_BASE_URL = "https://api.perplexity.ai/chat/completions";

/** Model identifier for Sonar's rapid online fact-checking endpoint. */
const MODEL = "sonar-rapid-online";

/** Maximum time to wait for a single API request (10s per spec). */
const REQUEST_TIMEOUT_MS = 10_000;

/** Maximum number of concurrent requests to allow (3 per spec). */
const MAX_CONCURRENT_REQUESTS = 3;

/** Maximum number of retries for failed requests (3 attempts total). */
const MAX_RETRIES = 2;

/** Delay between retries in milliseconds (1s → 2s → 4s per spec). */
const RETRY_DELAYS = [1000, 2000, 4000];

/** Shape of a successful Sonar API response. */
interface SonarResponse {
  verdict: "true" | "false" | "unclear";
  explanation: string;
  citations: Citation[];
  confidence: number;
}

/** Error subclass for API-related failures. */
class SonarAPIError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "SonarAPIError";
  }
}

/* -------------------------------------------------------------------------- */
/*                           Core helper functions                            */
/* -------------------------------------------------------------------------- */

/**
 * Create a properly formatted request to the Sonar API.
 *
 * @param claim - The text to fact-check.
 * @param apiKey - User's Perplexity API key from Options page.
 * @returns Request options for fetch().
 */
function buildRequest(claim: string, apiKey: string): RequestInit {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: claim }],
    }),
  };
}

/**
 * Validate and extract the relevant fields from a raw API response.
 *
 * @param raw - JSON response from Perplexity.
 * @returns Normalised response object.
 * @throws {SonarAPIError} If response is malformed.
 */
function parseResponse(raw: unknown): SonarResponse {
  if (!raw || typeof raw !== "object") {
    throw new SonarAPIError("Empty or malformed response");
  }

  const response = raw as Record<string, unknown>;
  const choices = response.choices;

  if (!Array.isArray(choices) || !choices.length) {
    throw new SonarAPIError("Missing choices array");
  }

  const firstChoice = choices[0] as
    | { message?: { content?: unknown } }
    | undefined;
  const content = firstChoice?.message?.content;
  if (!content || typeof content !== "string") {
    throw new SonarAPIError("Missing content in first choice");
  }

  try {
    const parsed = JSON.parse(content) as Partial<SonarResponse>;
    if (
      !parsed.verdict ||
      !parsed.explanation ||
      !Array.isArray(parsed.citations) ||
      typeof parsed.confidence !== "number"
    ) {
      throw new SonarAPIError("Missing required fields in response");
    }

    return parsed as SonarResponse;
  } catch (err) {
    throw new SonarAPIError("Failed to parse response JSON", err);
  }
}

/* -------------------------------------------------------------------------- */
/*                            Main exported function                          */
/* -------------------------------------------------------------------------- */

/**
 * Fact-check a single claim using the Perplexity Sonar API.
 *
 * @example
 *   const verdict = await callSonar(
 *     "The Earth is flat",
 *     "sk-1234..."  // from chrome.storage.sync
 *   );
 *   // → { claim: "...", verdict: "false", citations: [...], ... }
 *
 * @param claim - Text to fact-check (should be a single statement).
 * @param apiKey - User's Perplexity API key from Options page.
 *
 * @returns Promise resolving to a ClaimVerdict object.
 *
 * @throws {SonarAPIError}
 *   If the API request fails after all retries, or if the response is invalid.
 *   The error will have a descriptive message suitable for displaying to users.
 */
export async function callSonar(
  claim: string,
  apiKey: string,
): Promise<ClaimVerdict> {
  // Input validation
  if (!claim?.trim()) {
    throw new SonarAPIError("Empty claim");
  }
  if (!apiKey?.startsWith("sk-")) {
    throw new SonarAPIError("Invalid API key format");
  }

  // Create a concurrency limiter that allows up to 3 simultaneous requests
  const limit = pLimit(MAX_CONCURRENT_REQUESTS);

  // The core API request with timeout
  const makeRequest = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(PERPLEXITY_BASE_URL, {
        ...buildRequest(claim, apiKey),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new SonarAPIError(
          `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const data: unknown = await response.json();
      const result = parseResponse(data);

      return {
        claim,
        ...result,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // Wrap the request in retry logic
  return limit(() =>
    pRetry(makeRequest, {
      retries: MAX_RETRIES,
      minTimeout: RETRY_DELAYS[0],
      maxTimeout: RETRY_DELAYS[2],
      onFailedAttempt: (error: {
        attemptNumber: number;
        retriesLeft: number;
        message: string;
      }) => {
        console.warn(
          `Sonar request failed (attempt ${error.attemptNumber}/${
            error.retriesLeft + 1
          }):`,
          error.message,
        );
      },
    }),
  );
}
