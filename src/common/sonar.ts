/**
 * @file src/common/sonar.ts
 *
 * @description
 * Placeholder wrapper around Perplexity Sonar.  Always returns an `"unclear"`
 * verdict so that the rest of the extension can be wired up before live
 * networking is implemented (Step 8).
 */

import type { ClaimVerdict, Citation } from "./types";

/**
 * Static citation used in the stub response.
 */
const PLACEHOLDER_CITATION: Citation = {
  url: "https://example.com",
  title: "Placeholder citation – Sonar not yet wired",
};

/* -------------------------------------------------------------------------- */
/*                               Public helper                                */
/* -------------------------------------------------------------------------- */

/**
 * Fact-checks a single claim (stub).
 *
 * @param claim  – Claim text.
 * @param apiKey – API key (unused in stub).
 * @returns Promise resolving to a synthetic `ClaimVerdict`.
 */
export function callSonar(
  claim: string,
  apiKey?: string,
): Promise<ClaimVerdict> {
  void apiKey; // suppress “unused” lint until Step 8

  const result: ClaimVerdict = {
    claim,
    verdict: "unclear",
    explanation:
      "Perplexity Sonar integration not implemented – placeholder response.",
    citations: [PLACEHOLDER_CITATION],
    confidence: 0.5,
  };

  return Promise.resolve(result);
}
