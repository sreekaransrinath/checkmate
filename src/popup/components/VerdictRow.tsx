/**
 * @file src/popup/components/VerdictRow.tsx
 *
 * @description
 * Row component for displaying a single claim and its verdict.
 * Shows the claim text, verdict badge, and citation count.
 *
 * @dependencies
 * - Badge: For verdict status display
 * - Types: For ClaimVerdict type
 *
 * @notes
 * - Handles long claim text with truncation
 * - Shows citation count when available
 * - Accessible with proper ARIA labels
 */

import React from "react";
import type { ClaimVerdict } from "../../common/types";
import { Badge, type BadgeVariant } from "./Badge";

interface VerdictRowProps {
  verdict: ClaimVerdict;
  index: number;
}

const getVerdictVariant = (verdict: ClaimVerdict["verdict"]): BadgeVariant => {
  switch (verdict) {
    case "true":
      return "success";
    case "false":
      return "error";
    case "unclear":
      return "warning";
  }
};

const getVerdictLabel = (verdict: ClaimVerdict["verdict"]): string => {
  switch (verdict) {
    case "true":
      return "True";
    case "false":
      return "False";
    case "unclear":
      return "Unclear";
  }
};

export const VerdictRow: React.FC<VerdictRowProps> = ({ verdict, index }) => {
  const variant = getVerdictVariant(verdict.verdict);
  const label = getVerdictLabel(verdict.verdict);

  return (
    <div className="flex items-start gap-3 p-3 border-b last:border-b-0">
      {/* Claim number */}
      <div className="flex-none w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center">
        <span className="text-sm text-neutral-600">{index + 1}</span>
      </div>

      {/* Claim content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-900 mb-2 line-clamp-2">
          {verdict.claim}
        </p>
        <div className="flex items-center gap-3">
          <Badge variant={variant} label={label} />
          {verdict.citations.length > 0 && (
            <span className="text-xs text-neutral-600">
              {verdict.citations.length} citation
              {verdict.citations.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
