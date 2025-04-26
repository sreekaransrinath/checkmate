/**
 * @file src/popup/components/Badge.tsx
 *
 * @description
 * Badge component for displaying verdict status.
 * Uses color coding and icons to indicate true/false/unclear states.
 *
 * @dependencies
 * - Tailwind CSS: For styling
 *
 * @notes
 * - Fully accessible with ARIA labels
 * - Color-blind friendly with icons
 * - Responsive sizing
 */

import React from "react";

export type BadgeVariant = "success" | "error" | "warning";

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-800 border-green-200",
  error: "bg-red-100 text-red-800 border-red-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const variantIcons: Record<BadgeVariant, string> = {
  success: "✓",
  error: "✕",
  warning: "?",
};

export const Badge: React.FC<BadgeProps> = ({
  variant,
  label,
  className = "",
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-1
        text-xs font-medium rounded-full border
        ${variantStyles[variant]} ${className}
      `.trim()}
      role="status"
      aria-label={`${label} - ${variant}`}
    >
      <span className="w-3 h-3 inline-flex items-center justify-center">
        {variantIcons[variant]}
      </span>
      {label}
    </span>
  );
};
