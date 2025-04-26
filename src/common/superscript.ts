/**
 * @file src/common/superscript.ts
 *
 * @description
 * Generates Unicode superscripts.  For now it merely stringifies the input so
 * that other modules compile cleanly.  Full mapping arrives in Step 5.
 */

/* -------------------------------------------------------------------------- */
/*                               Public helper                                */
/* -------------------------------------------------------------------------- */

/**
 * Converts the provided number (or numeric string) into a superscript string.
 *
 * @param n – Number or numeric string.
 * @returns Same value stringified (placeholder implementation).
 */
export function sup(n: number | string): string {
  return n.toString();
}
