/**
 * @file src/common/superscript.ts
 *
 * @description
 * Converts ordinary Arabic numerals (0 – 9) into their Unicode superscript
 * representations so replies can show neat citation references such as `¹²`.
 * This utility is used by `buildReply()` and any UI element that needs to
 * render numeric superscripts (e.g., the claim table in the popup).
 *
 * Key features & design notes
 * ────────────────────────────────────────────────────────────────────────────
 * • Full coverage of the ten ASCII digits with a constant-time lookup table
 *   (`DIGIT_SUPERSCRIPT_MAP`).
 * • Accepts either a `number` or a `string` containing **only** ASCII digits;
 *   extra characters (e.g. whitespace, signs, letters) are considered invalid
 *   input and will trigger an `Error` in strict mode (see below).
 * • Pure function with no external dependencies; safe to use in both the
 *   background service-worker and any React code that runs in the DOM.
 * • Exhaustive inline documentation and runtime validations to aid future
 *   maintenance and guard against improper usage.
 *
 * @dependencies
 * None – the module is fully self-contained.
 *
 * @notes
 * • Superscripts for minus/plus signs are *not* required by the current
 *   product spec (§8.1).  If a future feature demands those glyphs, extend
 *   `DIGIT_SUPERSCRIPT_MAP` and relax the regex accordingly.
 * • The mapping is based on the Unicode Superscripts and Subscripts block
 *   (U+2070…U+2079).
 */

/* ────────────────────────────────────────────────────────────────────────── */
/*                               Implementation                               */
/* ────────────────────────────────────────────────────────────────────────── */

/** Map from ASCII digit → corresponding superscript glyph. */
const DIGIT_SUPERSCRIPT_MAP: Record<string, string> = {
  "0": "⁰", // U+2070
  "1": "¹", // U+00B9
  "2": "²", // U+00B2
  "3": "³", // U+00B3
  "4": "⁴", // U+2074
  "5": "⁵", // U+2075
  "6": "⁶", // U+2076
  "7": "⁷", // U+2077
  "8": "⁸", // U+2078
  "9": "⁹", // U+2079
};

/**
 * Runtime guard ensuring the input string contains nothing but ASCII digits.
 * A separate constant makes the intention explicit and avoids recompiling the
 * regex on every invocation.
 */
const ASCII_DIGITS_ONLY = /^[0-9]+$/;

/* -------------------------------------------------------------------------- */
/*                               Public helper                                */
/* -------------------------------------------------------------------------- */

/**
 * Converts the provided number (or numeric string) into a Unicode superscript
 * string.
 *
 * @example
 *   sup(42)        // "⁴²"
 *   sup("1503")    // "¹⁵⁰³"
 *
 * @throws {Error}  If the input is not a finite, non-negative integer or
 *                  contains any non-digit characters.
 *
 * @param n – A positive integer (`number`) **or** a string of ASCII digits.
 * @returns Superscript representation, e.g. `"²⁵"`.
 */
export function sup(n: number | string): string {
  // Convert to string early for unified processing
  const raw = typeof n === "number" ? String(n) : n;

  // Validation block – reject invalid inputs in development builds
  /* istanbul ignore next -- defensive code, difficult to hit in normal tests */
  if (!ASCII_DIGITS_ONLY.test(raw)) {
    throw new Error(
      `[sup] Input "${raw}" is not a non-negative integer composed exclusively of ASCII digits.`,
    );
  }

  // Map every individual digit to its superscript counterpart
  return [...raw].map((digit) => DIGIT_SUPERSCRIPT_MAP[digit]).join("");
}
