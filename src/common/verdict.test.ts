import { describe, expect, test } from "@jest/globals";
import { determineVerdict } from "./verdict";

describe("determineVerdict", () => {
  test('returns "true" for high confidence true claims', () => {
    const result = determineVerdict("true", 90);
    expect(result).toBe("true");
  });

  test('returns "false" for high confidence false claims', () => {
    const result = determineVerdict("false", 90);
    expect(result).toBe("false");
  });

  test('returns "unclear" for low confidence claims', () => {
    const result = determineVerdict("true", 50);
    expect(result).toBe("unclear");
  });

  test('returns "unclear" for unknown truth values', () => {
    const result = determineVerdict("unknown", 90);
    expect(result).toBe("unclear");
  });

  test("handles edge case confidence values", () => {
    expect(determineVerdict("true", 100)).toBe("true");
    expect(determineVerdict("false", 0)).toBe("unclear");
    expect(determineVerdict("true", -10)).toBe("unclear");
  });
});
