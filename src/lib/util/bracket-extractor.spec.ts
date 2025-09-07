import { extractFromBrackets } from "./bracket-extractor";

describe("extractFromBrackets", () => {
  test.each([
    // Basic bracket extraction
    ["n.d. [ca. 1770]", "ca. 1770"],
    ["n.d. [1850]", "1850"],
    ["undated [ca. 1900]", "ca. 1900"],
    ["[ca. 1825]", "ca. 1825"],
    
    // Different bracket content formats
    ["n.d. [about 1780]", "about 1780"],
    ["n.d. [c. 1790]", "c. 1790"],
    ["n.d. [probably 1800]", "probably 1800"],
    ["n.d. [1st half 19th century]", "1st half 19th century"],
    ["n.d. [early 19th century]", "early 19th century"],
    
    // Complex bracket content
    ["n.d. [ca. 1770-80]", "ca. 1770-80"],
    ["n.d. [1850-1860]", "1850-1860"],
    ["n.d. [mid-19th century]", "mid-19th century"],
    ["n.d. [before 1850]", "before 1850"],
    ["n.d. [after 1900]", "after 1900"],
    
    // With whitespace variations
    ["n.d. [ ca. 1770 ]", "ca. 1770"],
    ["n.d. [  1850  ]", "1850"],
    ["n.d.[ca. 1900]", "ca. 1900"],
    
    // Different prefixes
    ["undated [ca. 1770]", "ca. 1770"],
    ["not dated [ca. 1770]", "ca. 1770"],
    ["date unknown [ca. 1770]", "ca. 1770"],
    ["? [ca. 1770]", "ca. 1770"],
  ])("should extract '%s' -> '%s'", (input, expected) => {
    expect(extractFromBrackets(input)).toBe(expected);
  });

  test.each([
    // No brackets
    ["ca. 1770", null],
    ["1850", null],
    ["n.d.", null],
    ["undated", null],
    
    // Empty brackets
    ["n.d. []", ""],
    ["n.d. [  ]", ""],
    
    // No closing bracket
    ["n.d. [ca. 1770", null],
    
    // No opening bracket
    ["n.d. ca. 1770]", null],
    
    // Multiple brackets (returns first)
    ["n.d. [ca. 1770] [1850]", "ca. 1770"],
    
    // Empty string
    ["", null],
    
    // Just brackets
    ["[]", ""],
    ["[ ]", ""],
  ])("should handle edge cases: '%s' -> %s", (input, expected) => {
    expect(extractFromBrackets(input)).toBe(expected);
  });
});