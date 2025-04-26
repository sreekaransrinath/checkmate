/**
 * @file src/popup/utils/formatResults.ts
 *
 * @description
 * Utility functions for formatting analysis results into shareable text.
 *
 * @dependencies
 * - Types: For AnalysisResult type
 *
 * @notes
 * - Formats claims with verdict status and citations
 * - Adds a footer with attribution
 */

import type { AnalysisResult, ClaimVerdict } from "../../common/types";

const getVerdictEmoji = (verdict: ClaimVerdict["verdict"]): string => {
  switch (verdict) {
    case "true":
      return "✅";
    case "false":
      return "❌";
    case "unclear":
      return "❓";
  }
};

const getVerdictText = (verdict: ClaimVerdict["verdict"]): string => {
  switch (verdict) {
    case "true":
      return "True";
    case "false":
      return "False";
    case "unclear":
      return "Unclear";
  }
};

export const formatResults = (result: AnalysisResult): string => {
  const lines: string[] = [];

  // Add header
  lines.push("🔍 Check Mate Analysis");
  lines.push("");

  // Add each claim with its verdict
  result.verdicts.forEach((verdict, index) => {
    const emoji = getVerdictEmoji(verdict.verdict);
    const status = getVerdictText(verdict.verdict);

    lines.push(`${index + 1}. ${verdict.claim}`);
    lines.push(`${emoji} ${status}`);

    if (verdict.citations.length > 0) {
      lines.push(
        `📚 ${verdict.citations.length} citation${verdict.citations.length !== 1 ? "s" : ""}`,
      );
    }

    lines.push("");
  });

  // Add footer
  lines.push("Fact-checked with Check Mate");
  lines.push("https://github.com/sreekaransrinath/checkmate");

  return lines.join("\n");
};
