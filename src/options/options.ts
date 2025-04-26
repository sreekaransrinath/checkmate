/**
 * @file src/options/options.ts
 *
 * @description
 * Options page logic for Check Mate. Handles:
 * • API key management
 * • Confidence threshold settings
 * • Form validation
 * • Status messages
 *
 * Key features & design notes
 * ────────────────────────────────────────────────────────────────────────────
 * • **Form validation** – Ensures API key format is valid
 * • **Secure storage** – Uses chrome.storage.sync for settings
 * • **Visual feedback** – Shows success/error states and animations
 * • **Dark mode** – Detects system theme for consistent UI
 */

/* -------------------------------------------------------------------------- */
/*                              Constants & Types                             */
/* -------------------------------------------------------------------------- */

/** Default confidence threshold. */
const DEFAULT_THRESHOLD = 80;

/** Duration to show status messages (ms). */
const STATUS_DURATION = 3000;

/** Status message types. */
type StatusType = "success" | "error";

/* -------------------------------------------------------------------------- */
/*                           Core helper functions                            */
/* -------------------------------------------------------------------------- */

/**
 * Show a status message that fades out.
 *
 * @param elementId - ID of the status element.
 * @param message - Message to show.
 * @param type - Type of status (success/error).
 */
function showStatus(
  elementId: string,
  message: string,
  type: StatusType,
): void {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Set message and style
  element.textContent = message;
  element.className =
    "text-sm status-message " +
    (type === "success"
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400");

  // Clear any existing timeout
  const timeoutId = element.dataset.timeoutId;
  if (timeoutId) {
    clearTimeout(Number(timeoutId));
  }

  // Set up fade out
  const newTimeoutId = setTimeout(() => {
    element.dataset.fading = "true";
    setTimeout(() => {
      element.textContent = "";
      element.dataset.fading = "false";
    }, 200);
  }, STATUS_DURATION);

  element.dataset.timeoutId = String(newTimeoutId);
}

/**
 * Validate an API key format.
 *
 * @param apiKey - The API key to validate.
 * @returns Whether the key is valid.
 */
function isValidApiKey(apiKey: string): boolean {
  return apiKey.startsWith("sk-") && apiKey.length > 3;
}

/* -------------------------------------------------------------------------- */
/*                            Form initialization                             */
/* -------------------------------------------------------------------------- */

/**
 * Initialize the options form.
 */
async function initForm(): Promise<void> {
  // Get current settings
  const result = await chrome.storage.sync.get(["apiKey", "threshold"]);
  const apiKey = result.apiKey as string | undefined;
  const threshold =
    (result.threshold as number | undefined) ?? DEFAULT_THRESHOLD;

  // Set up API key field
  const apiKeyInput = document.getElementById("apiKey") as HTMLInputElement;
  const toggleApiKey = document.getElementById("toggleApiKey");
  const saveApiKey = document.getElementById("saveApiKey") as HTMLButtonElement;

  if (apiKeyInput && toggleApiKey && saveApiKey) {
    // Set initial value
    apiKeyInput.value = apiKey || "";

    // Handle visibility toggle
    toggleApiKey.addEventListener("click", () => {
      const isVisible = apiKeyInput.type === "text";
      apiKeyInput.type = isVisible ? "password" : "text";
      toggleApiKey.title = isVisible ? "Show API key" : "Hide API key";
    });

    // Handle save
    saveApiKey.addEventListener("click", () => {
      const newKey = apiKeyInput.value.trim();

      if (!isValidApiKey(newKey)) {
        showStatus("saveStatus", "Invalid API key format", "error");
        return;
      }

      void chrome.storage.sync
        .set({ apiKey: newKey })
        .then(() => {
          showStatus("saveStatus", "API key saved successfully", "success");
        })
        .catch((err) => {
          console.error("Failed to save API key:", err);
          showStatus("saveStatus", "Failed to save API key", "error");
        });
    });
  }

  // Set up threshold field
  const thresholdInput = document.getElementById(
    "threshold",
  ) as HTMLInputElement;
  const thresholdValue = document.getElementById("thresholdValue");
  const saveThreshold = document.getElementById(
    "saveThreshold",
  ) as HTMLButtonElement;

  if (thresholdInput && thresholdValue && saveThreshold) {
    // Set initial value
    thresholdInput.value = String(threshold);
    thresholdValue.textContent = `${threshold}%`;

    // Handle input changes
    thresholdInput.addEventListener("input", () => {
      const value = Number(thresholdInput.value);
      thresholdValue.textContent = `${value}%`;
    });

    // Handle save
    saveThreshold.addEventListener("click", () => {
      const value = Number(thresholdInput.value);

      void chrome.storage.sync
        .set({ threshold: value })
        .then(() => {
          showStatus(
            "thresholdStatus",
            "Threshold saved successfully",
            "success",
          );
        })
        .catch((err) => {
          console.error("Failed to save threshold:", err);
          showStatus("thresholdStatus", "Failed to save threshold", "error");
        });
    });
  }
}

/* -------------------------------------------------------------------------- */
/*                            Initial setup                                   */
/* -------------------------------------------------------------------------- */

// Initialize when page loads
void initForm();
