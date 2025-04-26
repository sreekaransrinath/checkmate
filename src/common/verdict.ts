/**
 * @file src/common/verdict.ts
 *
 * @description
 * Converts the *raw* verdict returned by the Perplexity Sonar model into the
 * **canonical** `"true" | "false" | "unclear"` labels used across Check Mate.
 *
 * The Sonar response already includes:
 *   • `verdict`    – Model-side judgement (`"true"` / `"false"` / `"unclear"`)
 *   • `citations`  – Array of supporting / refuting sources
 *   • `confidence` – Normalised score in the `[0, 1]` range
 *
 * However, we apply a lightweight heuristic (see §3.3 of the technical spec)
 * to make the classification more conservative and UX-friendly:
 *
 *   1. **Hard “false” override** – If the model says `"false"` **and**
 *      provides at least three citations, we accept it outright.  Users value
 *      strong, well-sourced refutations.
 *
 *   2. **Confidence guard-rail** – If confidence is below the *user-set*
 *      `threshold` (default 0.7), we downgrade to `"unclear"` no matter what
 *      the raw verdict says.  This prevents over-claiming on shaky evidence.
 *
 *   3. **Otherwise** – Treat everything else as `"true"`.  The assumption is
 *      that Sonar is generally conservative; if it calls something “true”
 *      and meets the confidence bar, we surface it as such.
 *
 * Edge-cases & safeguards
 * ────────────────────────────────────────────────────────────────────────────
 * • **Unexpected verdict strings** – The function defensively handles
 *   unknown values by *downgrading* to `"unclear"` instead of throwing,
 *   ensuring one bad server response won’t crash the extension UI.
 *
 * • **Threshold validation** – Runtime check guarantees `threshold` ∈ [0, 1].
 *   Out-of-range values would otherwise skew every verdict toward one side.
 *
 * • **Empty citation array** – Step 1 only triggers on `citations.length ≥ 3`,
 *   so short or missing citation arrays fall through to the confidence guard.
 *
 * @dependencies
 * None – pure utility.
 *
 * @exports
 * • {@link getVerdict} – Main helper.
 */

import type { ClaimVerdict } from "./types";

/* -------------------------------------------------------------------------- */
/*                            Helper type narrowings                          */
/* -------------------------------------------------------------------------- */

/** Literal union of allowed verdict strings returned by Sonar. */
type RawVerdictString = "true" | "false" | "unclear";

/* -------------------------------------------------------------------------- */
/*                          Public helper implementation                      */
/* -------------------------------------------------------------------------- */

/**
 * Post-processes a raw Sonar verdict into the canonical label used by
 * Check Mate’s UI components.
 *
 * @example
 *   getVerdict({ verdict: "false", citations: [c1, c2, c3], confidence: 0.91 })
 *   // → "false"
 *
 *   getVerdict({ verdict: "true", citations: [], confidence: 0.42 })
 *   // → "unclear"  (fails confidence guard)
 *
 * @param raw
 *   Subset of Sonar result required for the heuristic.  Using *Pick* keeps
 *   the call-sites tidy and avoids accidentally relying on other fields.
 *
 * @param threshold
 *   Minimum confidence (inclusive) needed to accept Sonar’s judgement
 *   wholesale.  The value is surfaced to users via the Options page and must
 *   therefore be runtime-validated.  Defaults to `0.7` per spec.
 *
 * @returns
 *   One of `"true"`, `"false"`, or `"unclear"`, ready for UI rendering.
 */
/**
 * Determine the verdict for a claim based on its truth value and confidence.
 *
 * @param truth - The truth value (true/false).
 * @param confidence - The confidence score (0-100).
 * @returns The verdict (true/false/unclear).
 */
export function determineVerdict(
  truth: string,
  confidence: number,
): "true" | "false" | "unclear" {
  // Normalize confidence to 0-100
  confidence = Math.max(0, Math.min(100, confidence));

  // If confidence is too low, mark as unclear
  if (confidence < 75) {
    return "unclear";
  }

  // Return verdict based on truth value
  if (truth === "true") return "true";
  if (truth === "false") return "false";
  return "unclear";
}

/**
 * Post-processes a raw Sonar verdict into the canonical label used by
 * Check Mate's UI components.
 *
 * @example
 *   getVerdict({ verdict: "false", citations: [c1, c2, c3], confidence: 0.91 })
 *   // → "false"
 *
 *   getVerdict({ verdict: "true", citations: [], confidence: 0.42 })
 *   // → "unclear"  (fails confidence guard)
 *
 * @param raw
 *   Subset of Sonar result required for the heuristic.  Using *Pick* keeps
 *   the call-sites tidy and avoids accidentally relying on other fields.
 *
 * @param threshold
 *   Minimum confidence (inclusive) needed to accept Sonar's judgement
 *   wholesale.  The value is surfaced to users via the Options page and must
 *   therefore be runtime-validated.  Defaults to `0.7` per spec.
 *
 * @returns
 *   One of `"true"`, `"false"`, or `"unclear"`, ready for UI rendering.
 */
export function getVerdict(
  raw: Pick<ClaimVerdict, "verdict" | "citations" | "confidence">,
  threshold = 0.7,
): "true" | "false" | "unclear" {
  /* ───── 0. Defensive parameter validation ───────────────────────────── */
  // Clamp the threshold to a sensible range to avoid accidental misuse.
  const clampedThreshold = Math.min(Math.max(threshold, 0), 1);

  // Normalise potential upstream surprises (extra whitespace, capitalisation).
  const verdict: RawVerdictString | "unknown" = (raw.verdict as string)
    .trim()
    .toLowerCase() as RawVerdictString | "unknown";

  /* ───── 1. Hard “false” override (≥ 3 citations) ────────────────────── */
  if (
    verdict === "false" &&
    Array.isArray(raw.citations) &&
    raw.citations.length >= 3
  ) {
    return "false";
  }

  /* ───── 2. Confidence guard-rail ────────────────────────────────────── */
  // Anything below the threshold is too shaky – label as “unclear”.
  if (Number.isFinite(raw.confidence) && raw.confidence < clampedThreshold) {
    return "unclear";
  }

  /* ───── 3. Fallbacks based on (possibly unknown) verdict string ─────── */
  switch (verdict) {
    case "true":
      return "true";
    case "false":
      // Either < 3 citations or some other reason – without enough backup and
      // above the confidence bar we *still* return “false”.
      return "false";
    case "unclear":
    default:
      // Any unexpected value is treated as “unclear” to avoid misleading users.
      return "unclear";
  }
}
