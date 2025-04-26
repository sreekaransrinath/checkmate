/**
 * @file src/common/claims.ts
 *
 * @description
 * Claim-splitting helper for Check Mate.
 * Currently a **stub**: returns an empty array so downstream code compiles.
 *
 * ⚠️  NOTE
 * Step 6 of the implementation plan will replace this placeholder with the
 * real sentence-segmentation algorithm.
 */

/* -------------------------------------------------------------------------- */
/*                               Public helper                                */
/* -------------------------------------------------------------------------- */

/**
 * Splits the given tweet text into individual factual claims.
 *
 * @param text – Raw tweet body (after dereferencing quotes / retweets).
 * @returns Empty array — full logic will be added in Step 6.
 */
export function splitIntoClaims(text: string): string[] {
  // placeholder to silence “unused parameter” lint until real logic exists
  void text;
  return [];
}

/**
 * The maximum number of claims we keep after truncation (see §3.2).
 */
export const MAX_CLAIMS = 5;
