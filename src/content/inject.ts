/**
 * @file src/content/inject.ts
 *
 * @description
 * Content script that injects the Check Mate button into tweet action bars.
 * Uses MutationObserver to watch for new tweets and inject buttons as needed.
 *
 * Key features & design notes
 * ────────────────────────────────────────────────────────────────────────────
 * • **Dynamic injection** – Handles both initial page load and dynamically
 *   added tweets (e.g., infinite scroll).
 * • **Deduplication** – Prevents multiple buttons on the same tweet.
 * • **Text extraction** – Handles regular tweets, retweets, and quotes.
 * • **Error states** – Shows toast messages for empty tweets or API errors.
 * • **Visual feedback** – Updates button status based on fact-check results.
 *
 * @dependencies
 * • tweet.css: Scoped styles for the injected button
 * • chrome.runtime: For messaging with background service worker
 */

import "../styles/tweet.css";

/* -------------------------------------------------------------------------- */
/*                              Constants & Types                             */
/* -------------------------------------------------------------------------- */

/** Selectors for finding tweet elements. */
const SELECTORS = {
  /** Main tweet article element. */
  tweet: 'article[data-testid="tweet"]',
  /** Container for tweet actions (reply, retweet, etc). */
  actionBar: '[role="group"]',
  /** Tweet text content. */
  tweetText: '[data-testid="tweetText"]',
  /** Share button (we inject next to this). */
  shareButton: '[data-testid="share"]',
} as const;

/** SVG icon for the Check Mate button. */
const BUTTON_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  <path d="m9 7.5 2 2 3-3" stroke="currentColor" fill="none" stroke-width="1.5"/>
</svg>
`;

/** Valid button status states. */
type ButtonStatus = "success" | "error" | "unclear" | null;

/* -------------------------------------------------------------------------- */
/*                           Core helper functions                            */
/* -------------------------------------------------------------------------- */

/**
 * Extract the tweet ID from a tweet article element.
 *
 * @param tweet - The tweet article element.
 * @returns The tweet ID, or null if not found.
 */
function getTweetId(tweet: Element): string | null {
  // Tweet ID is in the aria-labelledby attribute
  const labelId = tweet.getAttribute("aria-labelledby");
  if (!labelId?.includes("id-")) {
    return null;
  }
  return labelId.split("id-")[1];
}

/**
 * Extract the text content from a tweet element.
 *
 * @param tweet - The tweet article element.
 * @returns The tweet text, or null if empty.
 */
function getTweetText(tweet: Element): string | null {
  // Try the main tweet text first
  const textEl = tweet.querySelector(SELECTORS.tweetText);
  if (textEl?.textContent) {
    return textEl.textContent.trim();
  }

  // For retweets/quotes, try the inner tweet
  const quotedTweet = tweet.querySelector(SELECTORS.tweet);
  if (quotedTweet) {
    const quotedText = quotedTweet.querySelector(SELECTORS.tweetText);
    if (quotedText?.textContent) {
      return quotedText.textContent.trim();
    }
  }

  return null;
}

/**
 * Show a toast message to the user.
 *
 * @param message - The message to display.
 * @param duration - How long to show the toast (ms).
 */
function showToast(message: string, duration = 3000): void {
  const toast = document.createElement("div");
  toast.className = "cm-toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
}

/**
 * Create a Check Mate button element.
 *
 * @returns The button element.
 */
function createButton(): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = "cm-btn";
  button.innerHTML = BUTTON_ICON;
  button.title = "Fact-check this tweet";
  return button;
}

/**
 * Update a button's status and loading state.
 *
 * @param button - The button to update.
 * @param status - New status to set.
 * @param loading - Whether the button is in loading state.
 */
function updateButton(
  button: HTMLButtonElement,
  status: ButtonStatus,
  loading = false,
): void {
  button.dataset.status = status || "";
  button.dataset.loading = String(loading);
  button.title = loading
    ? "Fact-checking in progress..."
    : "Fact-check this tweet";
}

/* -------------------------------------------------------------------------- */
/*                            Button click handler                            */
/* -------------------------------------------------------------------------- */

/**
 * Handle a click on the Check Mate button.
 *
 * @param button - The clicked button.
 * @param tweet - The tweet article element.
 */
async function handleButtonClick(
  button: HTMLButtonElement,
  tweet: Element,
): Promise<void> {
  // Get tweet ID and text
  const tweetId = getTweetId(tweet);
  const text = getTweetText(tweet);

  // Validate we have content to check
  if (!tweetId || !text) {
    showToast("Nothing to fact-check in this tweet");
    return;
  }

  // Show loading state
  updateButton(button, null, true);

  try {
    // Send message to background service worker
    await chrome.runtime.sendMessage({
      type: "checkTweet",
      tweetId,
      text,
    });

    // Background will send "analysisComplete" when done
  } catch (err) {
    console.error("Failed to start fact-check:", err);
    showToast("Failed to start fact-check");
    updateButton(button, "error", false);
  }
}

/* -------------------------------------------------------------------------- */
/*                            Injection machinery                             */
/* -------------------------------------------------------------------------- */

/**
 * Inject a Check Mate button into a tweet's action bar.
 *
 * @param tweet - The tweet article element to inject into.
 */
function injectButton(tweet: Element): void {
  // Skip if we already added a button
  if (tweet.querySelector(".cm-btn")) {
    return;
  }

  // Find the action bar and share button
  const actionBar = tweet.querySelector(SELECTORS.actionBar);
  const shareButton = actionBar?.querySelector(SELECTORS.shareButton);
  if (!actionBar || !shareButton) {
    return;
  }

  // Create and inject our button
  const button = createButton();
  shareButton.parentElement?.insertBefore(button, shareButton);

  // Add click handler
  button.addEventListener("click", () => {
    void handleButtonClick(button, tweet);
  });
}

/**
 * Process a tweet element, injecting a button if needed.
 *
 * @param tweet - Tweet article element to process.
 */
function processTweet(tweet: Element): void {
  // Skip if this isn't actually a tweet
  if (!tweet.matches(SELECTORS.tweet)) {
    return;
  }

  // Inject our button
  injectButton(tweet);
}

/**
 * Set up the MutationObserver to watch for new tweets.
 */
function observeTweets(): void {
  // Process any existing tweets
  document.querySelectorAll(SELECTORS.tweet).forEach(processTweet);

  // Watch for new tweets
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // Skip if no nodes added
      if (!mutation.addedNodes.length) {
        continue;
      }

      // Process any new tweets
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          if (node.matches(SELECTORS.tweet)) {
            processTweet(node);
          } else {
            node.querySelectorAll(SELECTORS.tweet).forEach(processTweet);
          }
        }
      });
    }
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/* -------------------------------------------------------------------------- */
/*                          Message handler setup                             */
/* -------------------------------------------------------------------------- */

/**
 * Listen for analysis completion messages from the background.
 */
chrome.runtime.onMessage.addListener((message: unknown) => {
  const msg = message as { type?: string; success?: boolean } | undefined;
  if (msg?.type !== "analysisComplete") {
    return;
  }

  // Find all buttons and update their status
  document.querySelectorAll(".cm-btn").forEach((button) => {
    if (button instanceof HTMLButtonElement) {
      updateButton(button, msg.success ? "success" : "error", false);
    }
  });
});

/* -------------------------------------------------------------------------- */
/*                            Initial setup                                   */
/* -------------------------------------------------------------------------- */

// Start observing when the content script loads
observeTweets();
