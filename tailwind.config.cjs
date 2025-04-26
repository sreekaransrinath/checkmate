/**
 * @file tailwind.config.cjs
 *
 * Tailwind CSS design-system configuration for Check Mate.
 * Colors & font sizes follow §5.1 of the technical specification.
 * The config scans the `src/` and `public/` folders for class usage.
 *
 * @see https://tailwindcss.com/docs/configuration
 */

module.exports = {
    content: ["src/**/*.{ts,tsx}", "public/**/*.{html,js}"],
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          success: "#3CB371", // Success Green
          error: "#F44336",   // Error Red
          neutral: "#F1F3F4",
          text: "#202124",    // Text Dark
          link: "#1A73E8",    // Link Blue
        },
        fontFamily: {
          sans: ['Inter', 'Roboto', 'sans-serif'],
        },
        fontSize: {
          base: ["14px", "1.4"],
          h2: ["16px", { lineHeight: "1.4", fontWeight: "600" }],
        },
        borderRadius: {
          "btn": "6px",
        },
        spacing: {
          "grid": "8px",
        },
      },
    },
    plugins: [],
  };
  