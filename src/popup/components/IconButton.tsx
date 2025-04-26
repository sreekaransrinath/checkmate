/**
 * @file src/popup/components/IconButton.tsx
 *
 * @description
 * Reusable icon button component with tooltip.
 * Used for actions like copying results.
 *
 * @dependencies
 * - Tailwind CSS: For styling
 *
 * @notes
 * - Fully accessible with ARIA labels
 * - Shows tooltip on hover
 * - Supports disabled state
 * - Keyboard navigation friendly
 */

import React from "react";

interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  onClick,
  disabled = false,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        w-8 h-8 rounded-full
        text-neutral-600 hover:text-neutral-900
        hover:bg-neutral-100 active:bg-neutral-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${className}
      `.trim()}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
};
