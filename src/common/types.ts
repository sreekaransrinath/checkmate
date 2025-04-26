/**
 * @file src/common/types.ts
 *
 * @description
 * Centralised TypeScript model definitions used throughout the Check Mate extension.
 * These interfaces mirror the **§7 Data Types** section of the technical specification.
 *
 * Keeping every shared type in one place ensures:
 *  • Consistent data-shape contracts between the background script, content script,
 *    popup UI, and options page.
 *  • Easier refactors – updating a structure in one file propagates compile-time
 *    checks across the entire code-base.
 *  • Clear documentation for contributors on what each message / entity looks like.
 *
 * @notes
 * – All interfaces are exported individually so that feature modules can import
 *   only what they need (`import { ClaimVerdict } from "@common/types"`).
 * – A **strict** TypeScript environment is assumed (see `tsconfig.json`), so any
 *   divergence from these shapes will surface as a compile-time error.
 */

/* ────────────────────────────────────────────────────────────────────────── */
/*                1. Chrome runtime message contracts                        */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Fired by the **content script** when the user clicks the *Check Mate* button.
 *
 * The background service-worker will:
 *  1. Split `text` into factual claims.
 *  2. Query the Perplexity Sonar API.
 *  3. Persist an {@link AnalysisResult} in `chrome.storage.session`.
 *  4. Broadcast an `"analysisComplete"` message (see {@link AnalysisCompleteMessage}).
 */
export interface AnalysisRequest {
  /** Discriminator so listeners can early-return for other message types. */
  readonly type: "checkTweet";
  /** Snowflake-style Tweet ID (stringified 64-bit integer). */
  readonly tweetId: string;
  /** Raw tweet body *after* dereferencing quotes / retweets. */
  readonly text: string;
}

/**
 * Fired by the **background service-worker** after analysis has been written to
 * storage, signalling that per-tweet UI badges and the popup can refresh.
 */
export interface AnalysisCompleteMessage {
  readonly type: "analysisComplete";
  /** Propagated so the content script can match the DOM element quickly. */
  readonly tweetId: string;
}

/**
 * Union helper covering every message sent through `chrome.runtime.sendMessage`
 * in the current implementation. Extend this as new message types are added.
 */
export type RuntimeMessage = AnalysisRequest | AnalysisCompleteMessage;

/* ────────────────────────────────────────────────────────────────────────── */
/*                    2. Core domain model for fact-checking                 */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * A single citation returned by the Perplexity Sonar API.
 */
export interface Citation {
  /** Resolved URL of the supporting / refuting document. */
  readonly url: string;
  /** Human-readable headline or page title (may be empty for some domains). */
  readonly title: string;
}

/**
 * Result of fact-checking one isolated claim.
 */
export interface ClaimVerdict {
  /** Original claim text as sent to the model. */
  readonly claim: string;
  /**
   * Verdict returned after Sonar + heuristic post-processing.
   * – `"true"`     claim is factually correct
   * – `"false"`    claim is incorrect / misleading
   * – `"unclear"`  insufficient evidence or confidence below threshold
   */
  readonly verdict: "true" | "false" | "unclear";
  /**
   * Concise explanation from the LLM (one or two sentences) clarifying the
   * reasoning behind the verdict. Shown in the popup UI.
   */
  readonly explanation: string;
  /** Up to five citations supporting the verdict. */
  readonly citations: Citation[];
  /**
   * Normalised confidence score in the `[0, 1]` range, mirrored from Sonar’s
   * response. Down-stream logic (see `getVerdict`) can use this to downgrade
   * certainty.
   */
  readonly confidence: number;
}

/**
 * Aggregated result for an analysed tweet. Persisted in
 * `chrome.storage.session` under the key `"lastResult"` so the popup can load
 * the most recent analysis instantly without another network round-trip.
 */
export interface AnalysisResult {
  /** The tweet ID. */
  readonly tweetId: string;
  /** The full tweet text. */
  readonly text: string;
  /** List of claims extracted from the tweet. */
  readonly claims: string[];
  /** Ordered list (by claim position) of fact-check verdicts. */
  readonly verdicts: ClaimVerdict[];
}

/* ────────────────────────────────────────────────────────────────────────── */
/*                             3. Type re-exports                            */
/* ────────────────────────────────────────────────────────────────────────── */

export {
  // Re-exporting helps consumers *optionally* import a single namespace:
  //   import * as T from "@common/types";
  // while still allowing named imports.
  AnalysisRequest as TAnalysisRequest,
  AnalysisCompleteMessage as TAnalysisCompleteMessage,
  RuntimeMessage as TRuntimeMessage,
  Citation as TCitation,
  ClaimVerdict as TClaimVerdict,
  AnalysisResult as TAnalysisResult,
};
