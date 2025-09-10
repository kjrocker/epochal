import { getEraRegex, getMonthRegex } from "./regex";

describe("Month Regex Patterns", () => {
  describe("Month matching - positive cases", () => {
    test.each([
      // Correct spellings
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",

      // Abbreviations
      "jan",
      "feb",
      "mar",
      "apr",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",

      // Common misspellings
      "feburary", // transposed ru
      "febuary", // missing r
      "februrary", // extra r
      "feburar", // truncated
      "septemeber", // extra e

      // With periods
      "jan.",
      "feb.",
      "feburary.",
      // With commas
      "jan,",
      "feb,",
      "feburary,",
    ])("should match '%s'", (input) => {
      expect(getMonthRegex().test(input)).toBe(true);
    });
  });

  describe("Month matching - negative cases", () => {
    test.each([
      "ja", // too short
      "notamonth", // completely wrong
      "13month", // invalid
      "", // empty
      "   ", // whitespace only
    ])("should not match '%s'", (input) => {
      expect(getMonthRegex().test(input)).toBe(false);
    });
  });
});

describe("Era regex patterns", () => {
  describe("Era matching - positive cases", () => {
    test.each([
      "bc",
      "bce",
      "b.c.",
      "b.c",
      "b. c",
      "b .c.",
      "b.ce.",
      "b. ce.",
      "b ce",
      "ce",
      "c.e.",
      "c. e",
      "c. e.",
      "c e",
      "a.d.",
      "a. d",
      "a. d.",
      "a d",
    ])("should match '%s'", (input) => {
      expect(getEraRegex().test(input)).toBe(true);
    });
  });

  describe("Era matching - negative cases", () => {
    test.each(["january", "british", "wordb cotherword", "midbcofword"])(
      "should not match '%s'",
      (input) => {
        expect(getEraRegex().test(input)).toBe(false);
      }
    );
  });
});
