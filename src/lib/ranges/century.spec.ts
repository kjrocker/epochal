import { matchCenturyRange } from "./century";

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

    it("should handle complex modifiers", () => {
      const result = matchCenturyRange("late 13th–first half 14th century");
      expect(result).toEqual(["late 13th century", "first half 14th century"]);
    });

    // it("should handle more complex modifiers", () => {
    //   const result = matchCenturyRange("10th-11th century or later");
    //   expect(result).toEqual([
    //     "10th century or later",
    //     "11th century or later",
    //   ]);
    // });
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
