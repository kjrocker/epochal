import { printedModifier } from "./identity";

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
