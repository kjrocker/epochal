import { matchCastingRange, matchEraRange, matchYearShorthand } from "./year";

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

    it("should work with slashes", () => {
      const result = matchYearShorthand("1994/7");
      expect(result).toEqual(["1994", "1997"]);
    });
  });

  describe("question mark and dash patterns", () => {
    it("should handle question mark before dash", () => {
      const result = matchYearShorthand("1760?–70");
      expect(result).toEqual(["1760", "1770"]);
    });

    it("should handle question marks around dash", () => {
      const result = matchYearShorthand("1720?–?25");
      expect(result).toEqual(["1720", "1725"]);
    });

    it("should handle question mark after dash", () => {
      const result = matchYearShorthand("1705–?15");
      expect(result).toEqual(["1705", "1715"]);
    });

    it("should handle various dash types with question marks", () => {
      expect(matchYearShorthand("1740?—?50")).toEqual(["1740", "1750"]);
      expect(matchYearShorthand("1730?–?40")).toEqual(["1730", "1740"]);
      expect(matchYearShorthand("1735?‒?45")).toEqual(["1735", "1745"]);
    });

    it("should handle spaces around question marks and dashes", () => {
      const result = matchYearShorthand("1715 ? – ? 20");
      expect(result).toEqual(["1715", "1720"]);
    });

    it("should handle question marks with longer shorthand", () => {
      const result = matchYearShorthand("1800?–?25");
      expect(result).toEqual(["1800", "1825"]);
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

describe("matchEraRange", () => {
  it("should handle the basic case", () => {
    const result = matchEraRange("1999-2000 ad");
    expect(result).toEqual(["1999 ad", "2000 ad"]);
  });

  it("should handle bc", () => {
    const result = matchEraRange("1999-2000 bc");
    expect(result).toEqual(["1999 bc", "2000 bc"]);
  });

  it("should handle b.c.", () => {
    const result = matchEraRange("1999-2000 b.c.");
    expect(result).toEqual(["1999 b.c.", "2000 b.c."]);
  });

  it("should handle BC range with 'or later' modifier", () => {
    const result = matchEraRange("ca. 1961–1917 B.C. or later");
    expect(result).toEqual(["ca. 1961 B.C.", "1917 B.C. or later"]);
  });

  it("should handle era not at end of string", () => {
    const result = matchEraRange("1961–1917 B.C. or later");
    expect(result).toEqual(["1961 B.C.", "1917 B.C. or later"]);
  });
});

describe("matchCastingRange", () => {
  test.each([
    ["1903, cast 1905", "1903", "1905"],
    ["1903; cast 1905", "1903", "1905"],
    ["1903, carved 1905", "1903", "1905"],
    ["1903; carved 1905", "1903", "1905"],
    ["1903, cast ca. 1905", "1903", "ca. 1905"],
    ["ca. 1903, cast ca. 1905", "ca. 1903", "ca. 1905"],
    ["ca. 1903; cast ca. 1905", "ca. 1903", "ca. 1905"],
    ["903, carved 905", "903", "905"],
    ["903; carved 905", "903", "905"],
    ["903, cast ca. 905", "903", "ca. 905"],
    ["1896, cast ca. 1906", "1896", "ca. 1906"],
  ])("it should split %s into %s and %s", (input, start, end) => {
    expect(matchCastingRange(input)).toEqual([start, end]);
  });
});
