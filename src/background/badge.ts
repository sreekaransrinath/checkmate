/**
 * @file src/background/badge.ts
 *
 * @description
 * Helper utilities for managing the extension's toolbar badge. The badge shows
 * a visual indicator of the fact-checking status:
 *
 * • ✓ (green)  – All claims verified true
 * • ✕ (red)    – At least one claim is false
 * • ? (grey)   – Unclear or error state
 *
 * Key features & design notes
 * ────────────────────────────────────────────────────────────────────────────
 * • **Unicode symbols** – Uses UTF-8 check/x marks for better visibility
 * • **Consistent colors** – Matches design system colors from §5.1
 * • **Error states** – Grey badge for API errors or unclear verdicts
 * • **Reset support** – Can clear badge when navigating away
 *
 * @dependencies
 * • chrome.action API for badge manipulation
 */

/* -------------------------------------------------------------------------- */
/*                              Constants & Types                             */
/* -------------------------------------------------------------------------- */

/** Valid badge states that can be displayed. */
export type BadgeStatus = "success" | "error" | "unclear" | null;

/** Design system colors from §5.1. */
const BADGE_COLORS = {
  success: "#3CB371", // Success Green
  error: "#F44336", // Error Red
  unclear: "#9E9E9E", // Neutral Grey
} as const;

/** Unicode symbols for better visibility. */
const BADGE_TEXT = {
  success: "✓",
  error: "✕",
  unclear: "?",
  null: "", // Clear the badge
} as const;

/* -------------------------------------------------------------------------- */
/*                           Core helper functions                            */
/* -------------------------------------------------------------------------- */

/**
 * Set the global toolbar badge to reflect the current status.
 *
 * @example
 *   setGlobalBadge("success");  // Shows green ✓
 *   setGlobalBadge("error");    // Shows red ✕
 *   setGlobalBadge("unclear");  // Shows grey ?
 *   setGlobalBadge(null);       // Clears the badge
 *
 * @param status - The status to display, or null to clear.
 */
export async function setGlobalBadge(status: BadgeStatus): Promise<void> {
  // Clear badge if null status
  if (status === null) {
    await Promise.all([
      chrome.action.setBadgeText({ text: "" }),
      chrome.action.setBadgeBackgroundColor({ color: "" }),
    ]);
    return;
  }

  // Set badge text and color
  await Promise.all([
    chrome.action.setBadgeText({ text: BADGE_TEXT[status] }),
    chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS[status] }),
  ]);
}

/**
 * Determine the appropriate badge status based on claim verdicts.
 *
 * @param verdicts - Array of verdict strings from processed claims.
 * @returns The badge status to display.
 */
export function getBadgeStatus(
  verdicts: Array<"true" | "false" | "unclear">,
): BadgeStatus {
  if (!verdicts.length) {
    return null;
  }

  // If any verdict is false, show error
  if (verdicts.includes("false")) {
    return "error";
  }

  // If all verdicts are true, show success
  if (verdicts.every((v) => v === "true")) {
    return "success";
  }

  // Otherwise (some unclear), show unclear
  return "unclear";
}

/* -------------------------------------------------------------------------- */
/*                         Badge management lifecycle                         */
/* -------------------------------------------------------------------------- */

/**
 * Initialize badge handling:
 * • Clear badge on install
 * • Listen for tab updates to clear badge
 */
export function initBadgeHandling(): void {
  // Clear badge when extension is installed/updated
  chrome.runtime.onInstalled.addListener(() => {
    void setGlobalBadge(null);
  });

  // Clear badge when navigating away from Twitter
  chrome.tabs.onUpdated.addListener((tabId, info) => {
    if (info.url && !info.url.includes("twitter.com")) {
      void setGlobalBadge(null);
    }
  });
}
