import { handleYear } from "./year";
import { Maybe } from "./util/maybe";
import { DEFAULT_OPTIONS, EpochizeOptions } from "./util/options";

describe("handleYear", () => {
  describe("Basic year parsing", () => {
    const basicCases = [
      {
        input: "1650",
        description: "should parse 4-digit year",
        expectedStart: "1650-01-01T00:00:00.000Z",
        expectedEnd: "1650-12-31T23:59:59.999Z",
      },
      {
        input: "1853",
        description: "should parse another 4-digit year",
        expectedStart: "1853-01-01T00:00:00.000Z",
        expectedEnd: "1853-12-31T23:59:59.999Z",
      },
      {
        input: "2024",
        description: "should parse modern year",
        expectedStart: "2024-01-01T00:00:00.000Z",
        expectedEnd: "2024-12-31T23:59:59.999Z",
      },
      {
        input: "0001",
        description: "should parse year 1 AD",
        expectedStart: "0001-01-01T00:00:00.000Z",
        expectedEnd: "0001-12-31T23:59:59.999Z",
      },
    ];

    basicCases.forEach(({ input, description, expectedStart, expectedEnd }) => {
      it(description, () => {
        const result = handleYear(Maybe.some(input), DEFAULT_OPTIONS);

        expect(result.get()).not.toBeNull();

        const [start, end, meta] = result.get()!;
        expect(meta.handler).toContain("handleYear");
        expect(start.toISOString()).toBe(expectedStart);
        expect(end.toISOString()).toBe(expectedEnd);
      });
    });
  });

  describe("Era parsing (BC/AD)", () => {
    const eraCases = [
      {
        input: "50 bc",
        description: "should parse BC year",
        expectedStart: "-000049-01-01T00:00:00.000Z",
        expectedEnd: "-000049-12-31T23:59:59.999Z",
      },
      {
        input: "100 bc",
        description: "should parse BC year (lowercase)",
        expectedStart: "-000099-01-01T00:00:00.000Z",
        expectedEnd: "-000099-12-31T23:59:59.999Z",
      },
      {
        input: "500 ad",
        description: "should parse AD year (lowercase)",
        expectedStart: "0500-01-01T00:00:00.000Z",
        expectedEnd: "0500-12-31T23:59:59.999Z",
      },
      {
        input: "1066 ad",
        description: "should parse AD year (lowercase)",
        expectedStart: "1066-01-01T00:00:00.000Z",
        expectedEnd: "1066-12-31T23:59:59.999Z",
      },
    ];

    eraCases.forEach(({ input, description, expectedStart, expectedEnd }) => {
      it(description, () => {
        const result = handleYear(Maybe.some(input), DEFAULT_OPTIONS);

        expect(result.get()).not.toBeNull();

        const [start, end, meta] = result.get()!;
        expect(meta.handler).toContain("handleYear");
        expect(start.toISOString()).toBe(expectedStart);
        expect(end.toISOString()).toBe(expectedEnd);
      });
    });
  });

  describe("Century shorthand (2-digit years)", () => {
    const shorthandOptions: EpochizeOptions = {
      ...DEFAULT_OPTIONS,
      centuryShorthand: true,
      centuryBreakpoint: 29,
    };

    const shorthandCases = [
      {
        input: "85",
        description: "should interpret 85 as 1985 (above breakpoint)",
        expectedStart: "1985-01-01T00:00:00.000Z",
        expectedEnd: "1985-12-31T23:59:59.999Z",
      },
      {
        input: "15",
        description: "should interpret 15 as 2015 (below breakpoint)",
        expectedStart: "2015-01-01T00:00:00.000Z",
        expectedEnd: "2015-12-31T23:59:59.999Z",
      },
      {
        input: "29",
        description: "should interpret 29 as 2029 (at breakpoint)",
        expectedStart: "2029-01-01T00:00:00.000Z",
        expectedEnd: "2029-12-31T23:59:59.999Z",
      },
      {
        input: "30",
        description: "should interpret 30 as 1930 (above breakpoint)",
        expectedStart: "1930-01-01T00:00:00.000Z",
        expectedEnd: "1930-12-31T23:59:59.999Z",
      },
    ];

    shorthandCases.forEach(
      ({ input, description, expectedStart, expectedEnd }) => {
        it(description, () => {
          const result = handleYear(Maybe.some(input), shorthandOptions);

          expect(result.get()).not.toBeNull();

          const [start, end, meta] = result.get()!;
          expect(meta.handler).toContain("handleYear");
          expect(start.toISOString()).toBe(expectedStart);
          expect(end.toISOString()).toBe(expectedEnd);
        });
      }
    );

    it("should disable century shorthand when centuryShorthand is false", () => {
      const result = handleYear(Maybe.some("85"), DEFAULT_OPTIONS);

      expect(result.get()).not.toBeNull();

      const [start, end] = result.get()!;
      expect(start.getFullYear()).toBe(85);
      expect(end.getFullYear()).toBe(85);
    });
  });

  describe("Invalid inputs", () => {
    const invalidCases = [
      {
        input: "not-a-year",
        reason: "non-numeric input",
      },
      {
        input: "1990-2000",
        reason: "range format (not single year)",
      },
      {
        input: "early 1990s",
        reason: "partial date format",
      },
      {
        input: "19th century",
        reason: "century format",
      },
      {
        input: "01 October 9033",
        reason: "month + day",
      },
    ];

    invalidCases.forEach(({ input, reason }) => {
      it(`should reject "${input}" (${reason})`, () => {
        const result = handleYear(Maybe.some(input), DEFAULT_OPTIONS);
        expect(result.get()).toBeNull();
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle null input gracefully", () => {
      const result = handleYear(Maybe.none(), DEFAULT_OPTIONS);
      expect(result.get()).toBeNull();
    });

    it("should handle 5-digit years correctly", () => {
      // Current implementation accepts 5-digit years
      const result = handleYear(Maybe.some("12345"), DEFAULT_OPTIONS);
      expect(result.get()).not.toBeNull();

      const [start, end] = result.get()!;
      expect(start.getFullYear()).toBe(12345);
      expect(end.getFullYear()).toBe(12345);
    });

    it("should reject year 0 (invalid year)", () => {
      // Year 0 doesn't exist in the current implementation
      const result = handleYear(Maybe.some("0"), DEFAULT_OPTIONS);
      expect(result.get()).toBeNull();
    });

    it("should handle 3-digit years", () => {
      const result = handleYear(Maybe.some("500"), DEFAULT_OPTIONS);

      expect(result.get()).not.toBeNull();

      const [start, end] = result.get()!;
      expect(start.getFullYear()).toBe(500);
      expect(end.getFullYear()).toBe(500);
    });

    it("should handle 1-digit years", () => {
      const result = handleYear(Maybe.some("5"), DEFAULT_OPTIONS);

      expect(result.get()).not.toBeNull();

      const [start, end] = result.get()!;
      expect(start.getFullYear()).toBe(5);
      expect(end.getFullYear()).toBe(5);
    });
  });

  describe("Metadata validation", () => {
    it("should include correct handler in metadata", () => {
      const result = handleYear(Maybe.some("1850"), DEFAULT_OPTIONS);

      expect(result.get()).not.toBeNull();

      const [, , meta] = result.get()!;
      expect(meta.handler).toEqual(["handleYear"]);
    });

    it("should return proper date range structure", () => {
      const result = handleYear(Maybe.some("1900"), DEFAULT_OPTIONS);

      expect(result.get()).not.toBeNull();

      const [start, end] = result.get()!;

      // Start should be January 1st at midnight
      expect(start.getMonth()).toBe(0); // January
      expect(start.getDate()).toBe(1);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
      expect(start.getMilliseconds()).toBe(0);

      // End should be December 31st at 23:59:59.999
      expect(end.getMonth()).toBe(11); // December
      expect(end.getDate()).toBe(31);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
      expect(end.getSeconds()).toBe(59);
      expect(end.getMilliseconds()).toBe(999);
    });
  });

  describe("Circa modifier support", () => {
    const circaCases = [
      {
        input: "ca. 1650",
        description: "should parse 'ca.' prefix",
        expectedStart: 1647,
        expectedEnd: 1650,
      },
      {
        input: "c. 1800",
        description: "should parse 'c.' prefix",
        expectedStart: 1797,
        expectedEnd: 1800,
      },
      {
        input: "circa 1066",
        description: "should parse 'circa' prefix",
        expectedStart: 1063,
        expectedEnd: 1066,
      },
    ];

    circaCases.forEach(({ input, description, expectedStart, expectedEnd }) => {
      it(description, () => {
        const result = handleYear(Maybe.some(input), DEFAULT_OPTIONS);
        const parsed = result.get();
        expect(parsed).not.toBeNull();
        if (parsed) {
          const [start, end] = parsed;
          expect(start.getFullYear()).toBe(expectedStart);
          expect(end.getFullYear()).toBe(expectedEnd);
        }
      });
    });

    it("should handle 'after 1909' with default afterOffset", () => {
      const result = handleYear(Maybe.some("after 1909"), DEFAULT_OPTIONS);
      const [start, end] = result.get()!;
      expect(start.getFullYear()).toBe(1910);
      expect(end.getFullYear()).toBe(1919);
    });
  });
});
