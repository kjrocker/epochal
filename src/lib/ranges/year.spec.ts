import { matchYearShorthand } from "./year";

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

    xit("should work with slashes", () => {
      const result = matchYearShorthand("1994/7");
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
      expect(result).toEqual(["1925", "2020"]);
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

    it("should handle century turnover", () => {
      const result = matchYearShorthand("1999-02");
      expect(result).toEqual(["1999", "2002"]);
    });
  });
});
