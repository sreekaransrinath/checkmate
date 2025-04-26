import { describe, expect, test } from "@jest/globals";
import { splitIntoClaims } from "./claims";

describe("splitIntoClaims", () => {
  test("splits simple claims from text", () => {
    const text = "The Earth is flat. The moon is made of cheese.";
    const claims = splitIntoClaims(text);
    expect(claims).toEqual([
      "The Earth is flat.",
      "The moon is made of cheese.",
    ]);
  });

  test("handles text without claims", () => {
    const text = "Hello world!";
    const claims = splitIntoClaims(text);
    expect(claims).toEqual(["Hello world!"]);
  });

  test("handles empty text", () => {
    const text = "";
    const claims = splitIntoClaims(text);
    expect(claims).toEqual([]);
  });

  test("handles text with newlines", () => {
    const text = "First claim.\nSecond claim.\nThird claim.";
    const claims = splitIntoClaims(text);
    expect(claims).toEqual(["First claim.", "Second claim.", "Third claim."]);
  });

  test("handles abbreviations correctly", () => {
    const text = "The U.S. economy grew by 3%. Dr. Smith confirmed it.";
    const claims = splitIntoClaims(text);
    expect(claims).toEqual([
      "The U.S. economy grew by 3%.",
      "Dr. Smith confirmed it.",
    ]);
  });

  test("respects MAX_CLAIMS limit", () => {
    const text = "A. B. C. D. E. F. G. H. I. J.";
    const claims = splitIntoClaims(text);
    expect(claims.length).toBeLessThanOrEqual(5);
  });
});
