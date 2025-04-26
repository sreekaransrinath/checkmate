/**
 * @file src/common/verdict.ts
 *
 * @description
 * Heuristic wrapper that converts raw Sonar output into `"true" | "false" |
 * "unclear"`.  Real logic will land in Step 7.  This stub just echoes the raw
 * verdict so background code can compile.
 */

import type { ClaimVerdict } from "./types";

/* -------------------------------------------------------------------------- */
/*                               Public helper                                */
/* -------------------------------------------------------------------------- */

/**
 * Derive the final verdict.
 *
 * @param raw – Subset of `ClaimVerdict` relevant for the heuristic.
 * @param threshold – Minimum confidence to trust Sonar outright (default 0.7).
 * @returns `"true" | "false" | "unclear"`.
 */
export function getVerdict(
  raw: Pick<ClaimVerdict, "verdict" | "citations" | "confidence">,
  threshold = 0.7,
): "true" | "false" | "unclear" {
  void threshold; // not used yet – will matter in Step 7
  return raw.verdict;
}
