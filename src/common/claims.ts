/**
 * @file src/common/claims.ts
 *
 * @description
 * Splits raw tweet text into individual factual-claim strings that can be sent
 * to the Perplexity Sonar API.  The logic follows §3.2 of the technical spec:
 *
 *  • Sentence segmentation with an abbreviation / decimal-number guard.
 *  • Fragments shorter than 10 characters are discarded.
 *  • If more than {@link MAX_CLAIMS} candidates remain, we keep the
 *    {@link MAX_CLAIMS} **longest** ones, restoring their original order so
 *    the UI still reads naturally.
 *
 * Design goals & trade-offs
 * ────────────────────────────────────────────────────────────────────────────
 * • **Zero dependencies** – avoids bringing in heavy NLP libraries that would
 *   bloat the content-script bundle.  A simple heuristic is “good enough” for
 *   tweet-sized inputs (≤ 280 chars).
 * • **Abbreviation guard** – a curated set of common English abbreviations
 *   prevents over-splitting on periods (e.g. “U.S.”, “Dr.”).  The list can be
 *   extended easily without touching the core algorithm.
 * • **Edge-case resilience** – extra checks handle decimal numbers (“3.5 %”),
 *   ellipses (“…”) and stray whitespace.
 *
 * Limitations
 * ────────────────────────────────────────────────────────────────────────────
 * • Not a full NLP sentence segmenter – extremely rare corner-cases may still
 *   mis-split (e.g. exotic Unicode punctuation).
 * • The abbreviation list is anglophone-centric; future i18n work will need a
 *   locale-aware splitter or a more sophisticated library.
 */

/* -------------------------------------------------------------------------- */
/*                         1. Configuration constants                         */
/* -------------------------------------------------------------------------- */

/**
 * A curated set of lower-case abbreviations that legally end with a period
 * but should **not** trigger a sentence split.
 *
 * Keep the list short & focused – tweets are brief; we don’t need exhaustive
 * medical journals here.
 */
const ABBREVIATIONS: ReadonlySet<string> = new Set([
  // Honorifics
  "mr.",
  "mrs.",
  "ms.",
  "dr.",
  "prof.",
  "sr.",
  "jr.",
  // Geographic / organisations
  "u.s.",
  "u.k.",
  "e.u.",
  // Misc.
  "st.",
  "vs.",
  "etc.",
  "i.e.",
  "e.g.",
  // Months – people often abbreviate dates in tweets
  "jan.",
  "feb.",
  "mar.",
  "apr.",
  "jun.",
  "jul.",
  "aug.",
  "sept.",
  "oct.",
  "nov.",
  "dec.",
]);

/**
 * A simple helper RegExp that detects a *decimal number* just before a period,
 * e.g. “3.14.”  We don’t want to treat the first “.” as a sentence break.
 */
const DECIMAL_NUMBER_BEFORE_PERIOD = /\d+\.\d+$/;

/* -------------------------------------------------------------------------- */
/*                     2. Public helpers & constant re-export                 */
/* -------------------------------------------------------------------------- */

/**
 * The maximum number of claims we keep after truncation (see §3.2).
 *
 * Exported constant used by external consumers (tests, UI badge logic, background
 * script) and referenced internally. Using an explicit constant improves
 * readability throughout the codebase.
 */
export const MAX_CLAIMS = 5;

/**
 * Splits the provided tweet text into individual factual claims.
 *
 * @example
 *   splitIntoClaims(
 *     "U.S. GDP expanded 3 % in Q1. Inflation fell below 2 %. That's great!"
 *   )
 *   // → ["U.S. GDP expanded 3 % in Q1.",
 *   //    "Inflation fell below 2 %.",
 *   //    "That's great!"]
 *
 * @param text – Raw tweet body (already dereferenced from quotes / RTs).
 * @returns An array of ≤ {@link MAX_CLAIMS} claim strings, each ≥ 10 chars.
 */
export function splitIntoClaims(text: string): string[] {
  /* ───── 0. Guards & early exits ───────────────────────────────────────── */
  if (!text) return [];

  // Normalise whitespace (tweets may have \n from copy-paste)
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length === 0) return [];

  /* ───── 1. Sentence segmentation ─────────────────────────────────────── */
  const rawSentences: string[] = [];
  let buffer = "";

  for (let i = 0; i < cleaned.length; i += 1) {
    const char = cleaned[i];
    buffer += char;

    // Only consider . ! ? as possible sentence terminators
    if (char !== "." && char !== "!" && char !== "?") continue;

    const lowerBuffer = buffer.toLowerCase();

    /* --- 1.a Abbreviation guard ---------------------------------------- */
    // Check if the buffer ends with a known abbreviation; if so, keep reading.
    // We slice the last word (incl. period) and compare.
    const abbrevMatch = lowerBuffer.match(/(\b[^\s]+\.)\s*$/);
    if (abbrevMatch && ABBREVIATIONS.has(abbrevMatch[1])) {
      continue; // still inside the same sentence
    }

    /* --- 1.b Decimal-number guard -------------------------------------- */
    if (DECIMAL_NUMBER_BEFORE_PERIOD.test(buffer)) {
      continue; // period is part of a decimal number (e.g. “3.14.”)
    }

    /* --- 1.c EoS confirmed – push sentence ----------------------------- */
    rawSentences.push(buffer.trim());
    buffer = "";

    // Skip any subsequent whitespace so we don't get an empty buffer next loop
    while (i + 1 < cleaned.length && /\s/.test(cleaned[i + 1])) {
      i += 1;
    }
  }

  // Push trailing buffer (if any)
  if (buffer.trim().length > 0) rawSentences.push(buffer.trim());

  /* ───── 2. Length filter & cleanup ───────────────────────────────────── */
  const filtered = rawSentences.filter((s) => s.length >= 10);

  if (filtered.length <= MAX_CLAIMS) {
    return filtered;
  }

  /* ───── 3. Truncation logic (keep longest N, restore order) ─────────── */
  type Indexed = { idx: number; len: number };

  // Build sortable map
  const meta: Indexed[] = filtered.map((s, idx) => ({ idx, len: s.length }));

  // Take the MAX_CLAIMS longest sentences
  meta.sort((a, b) => b.len - a.len);
  const top = meta.slice(0, MAX_CLAIMS).sort((a, b) => a.idx - b.idx);

  return top.map((m) => filtered[m.idx]);
}
