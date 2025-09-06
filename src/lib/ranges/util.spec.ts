import { matchTo } from "./util";

describe("matchTo", () => {
  it("doesn't match October", () => {
    expect(matchTo("01 October 1918")).toBeNull();
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

    it("should reject formats without spaces", () => {
      const result = matchTo("1800or1850");
      expect(result).toBeNull();
    });
  });
});
