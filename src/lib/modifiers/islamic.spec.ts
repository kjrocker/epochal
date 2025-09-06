import { islamicModifier } from "./islamic";

describe("printedModifer", () => {
  const modifier = islamicModifier();
  const { predicate, extractor } = modifier;

  test.each([
    ["dated A.H. 199/799", "799"],
    ["A.H. 199/799", "799"],
  ])(
    "predicate accepts and extractor processes '%s' -> '%s'",
    (input, expected) => {
      expect(predicate(input.toLowerCase().trim())).toBe(true);
      expect(extractor(input.toLowerCase().trim())).toBe(expected);
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
