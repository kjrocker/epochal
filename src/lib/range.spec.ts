import { matchYearShorthand, matchCenturyRange, matchTo } from "./range";

describe("matchYearShorthand", () => {
  describe("basic shorthand expansion", () => {
    it("should expand 4-digit to 1-digit shorthand", () => {
      const result = matchYearShorthand("1994-7");
      expect(result).toEqual(["1994", "1997"]);
    });

    it("should expand 4-digit to 2-digit shorthand", () => {
      const result = matchYearShorthand("1920-25");
      expect(result).toEqual(["1920", "1925"]);
    });

    it("should expand 3-digit to 1-digit shorthand", () => {
      const result = matchYearShorthand("994-7");
      expect(result).toEqual(["994", "997"]);
    });

    it("should expand 3-digit to 2-digit shorthand", () => {
      const result = matchYearShorthand("920-25");
      expect(result).toEqual(["920", "925"]);
    });
  });

  describe("different dash types", () => {
    it("should work with hyphens", () => {
      const result = matchYearShorthand("1994-7");
      expect(result).toEqual(["1994", "1997"]);
    });

    it("should work with en-dashes", () => {
      const result = matchYearShorthand("1994–7");
      expect(result).toEqual(["1994", "1997"]);
    });

    it("should work with em-dashes", () => {
      const result = matchYearShorthand("1994—7");
      expect(result).toEqual(["1994", "1997"]);
    });
  });

  describe("with modifiers", () => {
    it("should handle circa prefix", () => {
      const result = matchYearShorthand("ca. 1909-27");
      expect(result).toEqual(["ca. 1909", "1927"]);
    });

    it("should handle after prefix", () => {
      const result = matchYearShorthand("after 1920-25");
      expect(result).toEqual(["after 1920", "1925"]);
    });

    it("should handle multiple prefixes", () => {
      const result = matchYearShorthand("ca. after 1850-55");
      expect(result).toEqual(["ca. after 1850", "1855"]);
    });
  });

  describe("edge cases", () => {
    it("should handle same last digits (not shorthand)", () => {
      const result = matchYearShorthand("1920-20");
      expect(result).toBeNull();
    });

    it("should handle decreasing end digit (not shorthand)", () => {
      const result = matchYearShorthand("1925-20");
      expect(result).toBeNull();
    });

    it("should handle full years (not shorthand)", () => {
      const result = matchYearShorthand("1920-1925");
      expect(result).toBeNull();
    });

    it("should handle non-numeric content", () => {
      const result = matchYearShorthand("early-late");
      expect(result).toBeNull();
    });

    it("should handle mixed content", () => {
      const result = matchYearShorthand("1920-late");
      expect(result).toBeNull();
    });

    it("should handle single part", () => {
      const result = matchYearShorthand("1920");
      expect(result).toBeNull();
    });

    it("should handle multiple dashes", () => {
      const result = matchYearShorthand("1920-25-30");
      expect(result).toBeNull();
    });
  });

  describe("boundary conditions", () => {
    it("should handle 1-digit to 1-digit (different)", () => {
      const result = matchYearShorthand("5-7");
      expect(result).toEqual(["5", "7"]);
    });

    it("should handle 2-digit to 1-digit", () => {
      const result = matchYearShorthand("20-5");
      expect(result).toEqual(["20", "25"]);
    });

    it("should handle leading zeros", () => {
      const result = matchYearShorthand("2000-05");
      expect(result).toEqual(["2000", "2005"]);
    });
  });

  describe("matchCenturyRange", () => {
    describe("basic century ranges", () => {
      it("should expand 18th–19th century", () => {
        const result = matchCenturyRange("18th–19th century");
        expect(result).toEqual(["18th century", "19th century"]);
      });

      it("should expand 17th–18th century", () => {
        const result = matchCenturyRange("17th–18th century");
        expect(result).toEqual(["17th century", "18th century"]);
      });

      it("should expand 1st–3rd century", () => {
        const result = matchCenturyRange("1st–3rd century");
        expect(result).toEqual(["1st century", "3rd century"]);
      });
    });

    describe("different dash types", () => {
      it("should work with hyphens", () => {
        const result = matchCenturyRange("18th-19th century");
        expect(result).toEqual(["18th century", "19th century"]);
      });

      it("should work with en-dashes", () => {
        const result = matchCenturyRange("18th–19th century");
        expect(result).toEqual(["18th century", "19th century"]);
      });

      it("should work with em-dashes", () => {
        const result = matchCenturyRange("18th—19th century");
        expect(result).toEqual(["18th century", "19th century"]);
      });
    });

    describe("with modifiers", () => {
      it("should handle early/late modifiers", () => {
        const result = matchCenturyRange("late 18th–early 19th century");
        expect(result).toEqual(["late 18th century", "early 19th century"]);
      });

      it("should handle mid modifier", () => {
        const result = matchCenturyRange("mid 17th–18th century");
        expect(result).toEqual(["mid 17th century", "18th century"]);
      });
    });

    describe("with era markers", () => {
      it("should handle BC centuries", () => {
        const result = matchCenturyRange("3rd–2nd century bc");
        expect(result).toEqual(["3rd century bc", "2nd century bc"]);
      });

      it("should handle mixed era", () => {
        const result = matchCenturyRange("1st century bc–1st century ad");
        expect(result).toEqual(["1st century bc", "1st century ad"]);
      });
    });

    describe("edge cases", () => {
      it("should return null for non-century patterns", () => {
        const result = matchCenturyRange("1800-1900");
        expect(result).toBeNull();
      });

      it("should return null for single century", () => {
        const result = matchCenturyRange("18th century");
        expect(result).toBeNull();
      });

      it("should return null for non-matching patterns", () => {
        const result = matchCenturyRange("eighteen century");
        expect(result).toBeNull();
      });
    });
  });

  describe("matchTo (including 'or')", () => {
    describe("basic 'to' ranges", () => {
      it("should handle '1800 to 1850'", () => {
        const result = matchTo("1800 to 1850");
        expect(result).toEqual(["1800", "1850"]);
      });

      it("should handle '18th century to 19th century'", () => {
        const result = matchTo("18th century to 19th century");
        expect(result).toEqual(["18th century", "19th century"]);
      });
    });

    describe("'or' ranges", () => {
      it("should handle '1800 or 1850'", () => {
        const result = matchTo("1800 or 1850");
        expect(result).toEqual(["1800", "1850"]);
      });

      it("should handle '18th century or 19th century'", () => {
        const result = matchTo("18th century or 19th century");
        expect(result).toEqual(["18th century", "19th century"]);
      });

      it("should handle 'ca. 1800 or ca. 1850'", () => {
        const result = matchTo("ca. 1800 or ca. 1850");
        expect(result).toEqual(["ca. 1800", "ca. 1850"]);
      });
    });

    describe("edge cases", () => {
      it("should return null for single value", () => {
        const result = matchTo("1800");
        expect(result).toBeNull();
      });

      it("should return null for multiple separators", () => {
        const result = matchTo("1800 to 1850 to 1900");
        expect(result).toBeNull();
      });

      it("should return null for mixed separators", () => {
        const result = matchTo("1800 to 1850 or 1900");
        expect(result).toBeNull();
      });

      it("should handle whitespace variations", () => {
        const result = matchTo("1800or1850");
        expect(result).toEqual(["1800", "1850"]);
      });
    });
  });
});
