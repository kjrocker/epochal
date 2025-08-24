import { handleYearRangeShorthand } from "./year-range-shorthand";
import { Maybe } from "./util/maybe";
import { DEFAULT_OPTIONS } from "./util/options";

describe("Year Range Shorthand Parser", () => {
  describe("Valid shorthand patterns", () => {
    const validCases = [
      // Two-digit shorthand cases
      {
        input: "1835-8",
        description: "1835-8 should parse as 1835 to 1838",
        expectedStart: "1835-01-01T00:00:00.000Z",
        expectedEnd: "1838-12-31T23:59:59.999Z",
      },
      {
        input: "2016-25",
        description: "2016-25 should parse as 2016 to 2025",
        expectedStart: "2016-01-01T00:00:00.000Z",
        expectedEnd: "2025-12-31T23:59:59.999Z",
      },
      {
        input: "1914-21",
        description: "1914-21 should parse as 1914 to 1921",
        expectedStart: "1914-01-01T00:00:00.000Z",
        expectedEnd: "1921-12-31T23:59:59.999Z",
      },
      // One-digit shorthand cases
      {
        input: "1990-5",
        description: "1990-5 should parse as 1990 to 1995",
        expectedStart: "1990-01-01T00:00:00.000Z",
        expectedEnd: "1995-12-31T23:59:59.999Z",
      },
      {
        input: "2001-9",
        description: "2001-9 should parse as 2001 to 2009",
        expectedStart: "2001-01-01T00:00:00.000Z",
        expectedEnd: "2009-12-31T23:59:59.999Z",
      },
      // Century transition
      //   {
      //     input: "1995-06",
      //     description:
      //       "1995-06 should parse as 1995 to 2006 (century transition)",
      //     expectedStart: "1995-01-01T00:00:00.000Z",
      //     expectedEnd: "2006-12-31T23:59:59.999Z",
      //   },
    ];

    validCases.forEach(({ input, description, expectedStart, expectedEnd }) => {
      it(description, () => {
        const result = handleYearRangeShorthand(
          Maybe.some(input),
          DEFAULT_OPTIONS
        );

        expect(result.get()).not.toBeNull();

        const [start, end, meta] = result.get()!;
        expect(meta.handler).toContain("handleYear");
        expect(start.toISOString()).toBe(expectedStart);
        expect(end.toISOString()).toBe(expectedEnd);
      });
    });
  });

  describe("Invalid shorthand patterns", () => {
    const invalidCases = [
      {
        input: "1990-0",
        reason: "end digit (0) is not greater than start digit (0)",
      },
      {
        input: "2020-10",
        reason: "end digit (0) is not greater than start digit (0)",
      },
      {
        input: "1995-05",
        reason: "end digit (5) is not greater than start digit (5)",
      },
      {
        input: "abc-def",
        reason: "non-numeric input",
      },
      {
        input: "2020",
        reason: "missing range separator",
      },
      {
        input: "2020-abc",
        reason: "non-numeric end value",
      },
      {
        input: "1900-925",
        reason: "three-digit shorthand not supported",
      },
    ];

    invalidCases.forEach(({ input, reason }) => {
      it(`should reject "${input}" (${reason})`, () => {
        const result = handleYearRangeShorthand(
          Maybe.some(input),
          DEFAULT_OPTIONS
        );
        expect(result.get()).toBeNull();
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle null input gracefully", () => {
      const result = handleYearRangeShorthand(Maybe.none(), DEFAULT_OPTIONS);
      expect(result.get()).toBeNull();
    });

    // it("should handle empty string input", () => {
    //   const result = handleYearRangeShorthand(Maybe.some(""), DEFAULT_OPTIONS);
    //   expect(result.get()).toBeNull();
    // });
  });
});
