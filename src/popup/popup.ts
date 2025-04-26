/**
 * @file src/popup/popup.ts
 *
 * @description
 * Popup UI logic for Check Mate. Handles:
 * • Showing appropriate UI states (API key missing, not on Twitter, etc.)
 * • Displaying fact-check results from storage
 * • Navigation to options page
 *
 * Key features & design notes
 * ────────────────────────────────────────────────────────────────────────────
 * • **State management** – Uses a simple state machine to handle UI states
 * • **Dark mode** – Detects system theme and applies appropriate styles
 * • **Animations** – Smooth transitions between states and for claim cards
 * • **Error handling** – Clear feedback for API key and other issues
 */

import type { AnalysisResult } from "../common/types";

/* -------------------------------------------------------------------------- */
/*                              Constants & Types                             */
/* -------------------------------------------------------------------------- */

/** All possible UI states for the popup. */
type PopupState = "loading" | "noApiKey" | "notOnTwitter" | "results";

/** Map of state names to their element IDs. */
const STATE_ELEMENTS: Record<PopupState, string> = {
  loading: "loading",
  noApiKey: "noApiKey",
  notOnTwitter: "notOnTwitter",
  results: "results",
} as const;

/* -------------------------------------------------------------------------- */
/*                           Core helper functions                            */
/* -------------------------------------------------------------------------- */

/**
 * Show a specific state and hide all others.
 *
 * @param state - The state to show.
 */
function showState(state: PopupState): void {
  // Hide all states first
  Object.values(STATE_ELEMENTS).forEach((id) => {
    document.getElementById(id)?.classList.add("hidden");
  });

  // Show the requested state
  document.getElementById(STATE_ELEMENTS[state])?.classList.remove("hidden");
}

/**
 * Create a claim card element.
 *
 * @param claim - The claim text.
 * @param verdict - The verdict (true/false/unclear).
 * @returns The claim card element.
 */
function createClaimCard(
  claim: string,
  verdict: "true" | "false" | "unclear",
): HTMLElement {
  const card = document.createElement("div");
  card.className =
    "claim-card p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2";

  const text = document.createElement("p");
  text.className = "text-sm";
  text.textContent = claim;

  const badge = document.createElement("span");
  badge.className = "verdict-badge";
  badge.dataset.verdict = verdict;
  badge.textContent = {
    true: "True",
    false: "False",
    unclear: "Unclear",
  }[verdict];

  card.append(text, badge);
  return card;
}

/* -------------------------------------------------------------------------- */
/*                            Main popup logic                                */
/* -------------------------------------------------------------------------- */

/**
 * Initialize the popup UI.
 */
async function initPopup(): Promise<void> {
  // Show loading state initially
  showState("loading");

  try {
    // Check if API key is set
    const apiKeyResult = await chrome.storage.sync.get("apiKey");
    const apiKey = apiKeyResult.apiKey as string | undefined;
    if (!apiKey?.startsWith("sk-")) {
      showState("noApiKey");
      return;
    }

    // Get current tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    // Check if we're on Twitter
    if (!tab.url?.includes("twitter.com")) {
      showState("notOnTwitter");
      return;
    }

    // Try to get analysis results
    const { analysisResult } =
      await chrome.storage.session.get("analysisResult");
    const result = analysisResult as AnalysisResult | undefined;

    if (!result) {
      showState("notOnTwitter"); // No results yet
      return;
    }

    // Show results
    showState("results");
    document.getElementById("tweetText")!.textContent = result.text;

    const claimsList = document.getElementById("claimsList")!;
    result.claims.forEach((claim: string, i: number) => {
      const verdict = result.verdicts[i].verdict as
        | "true"
        | "false"
        | "unclear";
      const card = createClaimCard(claim, verdict);
      claimsList.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to initialize popup:", err);
    showState("notOnTwitter"); // Fallback state
  }
}

/* -------------------------------------------------------------------------- */
/*                           Event listeners                                  */
/* -------------------------------------------------------------------------- */

// Handle settings button click
document.getElementById("settingsBtn")?.addEventListener("click", () => {
  void chrome.runtime.openOptionsPage();
});

// Handle "Open Settings" button click
document.getElementById("openOptionsBtn")?.addEventListener("click", () => {
  void chrome.runtime.openOptionsPage();
});

// Initialize when popup opens
void initPopup();
