import { printedModifier, parentheticalModifier } from "./identity";

describe("printedModifer", () => {
  const modifier = printedModifier();
  const { predicate, extractor } = modifier;

  test.each([
    ["1919, printed 1928", "1919"],
    ["early 20th century, printed later", "early 20th century"],
    ["1850, printed in London 1855", "1850"],
    ["Renaissance period, printed by Giovanni", "Renaissance period"],
    ["15th century, printed posthumously", "15th century"],
  ])(
    "predicate accepts and extractor processes '%s' -> '%s'",
    (input, expected) => {
      expect(predicate(input)).toBe(true);
      expect(extractor(input)).toBe(expected);
    }
  );

  test.each([
    "1919 printed 1928", // no comma
    "1850 printing house", // different word
    "Renaissance printed work", // no comma
  ])("predicate rejects '%s'", (input) => {
    expect(predicate(input)).toBe(false);
  });
});

describe("parentheticalModifier", () => {
  const modifier = parentheticalModifier();
  const { predicate, extractor } = modifier;

  test.each([
    ["19th century (uncertain)", "19th century"],
    ["1850-1900 [estimated]", "1850-1900"],
    ["Renaissance period (Italian)", "Renaissance period"],
    ["early 20th century (ca. 1920)", "early 20th century"],
    ["medieval era [approximate date]", "medieval era"],
    ["1789 (French Revolution)", "1789"],
  ])(
    "predicate accepts and extractor processes '%s' -> '%s'",
    (input, expected) => {
      expect(predicate(input)).toBe(true);
      expect(extractor(input)).toBe(expected);
    }
  );

  test.each([
    "19th century uncertain", // no parentheses
    "(uncertain) 19th century", // at beginning
    "19th (middle) century", // in middle
    "1850-1900", // no brackets
  ])("predicate rejects '%s'", (input) => {
    expect(predicate(input)).toBe(false);
  });
});
