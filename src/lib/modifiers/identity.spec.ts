import {
  identityModifier,
  printedModifier,
  parentheticalModifier,
  afterOriginalModifier,
  zodiacModifier,
} from "./identity";

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

describe("afterOriginalModifier", () => {
  const modifier = afterOriginalModifier();
  const { predicate, extractor } = modifier;

  test.each([
    ["1610–11, after 1610–11 original", "1610–11"],
    ["19th century, after Renaissance original", "19th century"],
    ["1850-1900, after medieval original", "1850-1900"],
    ["early 20th century, after Byzantine original", "early 20th century"],
    ["Renaissance period, after Roman original", "Renaissance period"],
    ["1789, after ancient Greek original", "1789"],
  ])(
    "predicate accepts and extractor processes '%s' -> '%s'",
    (input, expected) => {
      expect(predicate(input)).toBe(true);
      expect(extractor(input)).toBe(expected);
    }
  );

  test.each([
    "1610–11 after original", // no comma
    "after 1610–11 original", // at beginning
    "1610–11, before original", // different preposition
    "1850-1900", // no after phrase
    "19th century, after original work", // doesn't end with "original"
  ])("predicate rejects '%s'", (input) => {
    expect(predicate(input)).toBe(false);
  });
});

describe("zodiacModifier", () => {
  const modifier = zodiacModifier();
  const { predicate, extractor } = modifier;

  test.each([
    // "<word> year" format at end
    ["6th month ox year 1853", "6th month 1853"],
    ["7th month tiger year 1854", "7th month 1854"],
    ["7th month Hare year 1855", "7th month 1855"],
    ["4th month horse year 1858", "4th month 1858"],
    ["3rd month dragon year 1868", "3rd month 1868"],
    ["4th month snake year 1857", "4th month 1857"],
    ["1850 rabbit year", "1850"],
    ["early 20th century monkey year", "early 20th century"],
    // "year of the <word>" format at beginning
    ["year of the ox 1853", "1853"],
    ["year of the tiger 1854", "1854"],
    ["year of the dragon 1868", "1868"],
    ["year of the snake 4th month 1857", "4th month 1857"],
    // "year-first, year of the <word>" format (new cases from failing examples)
    ["1794, year of the tiger", "1794"],
    ["1795, year of the rabbit", "1795"],
    ["1798, year of the horse", "1798"],
    ["1796, year of the dragon", "1796"],
    ["1800, year of the monkey", "1800"],
  ])(
    "predicate accepts and extractor processes '%s' -> '%s'",
    (input, expected) => {
      expect(predicate(input)).toBe(true);
      expect(extractor(input)).toBe(expected);
    }
  );

  test.each([
    "6th month 1853", // no zodiac word
    "ox year", // no date part
    "year ox 1853", // missing "of the"
    "1853 year ox", // wrong order
    "year of ox 1853", // missing "the"
    "month ox 1853", // no "year"
    "1794 year of the tiger", // missing comma
    "1795, year the rabbit", // missing "of"
    "1798, year of tiger", // missing "the"
  ])("predicate rejects '%s'", (input) => {
    expect(predicate(input)).toBe(false);
  });
});

describe("identityModifier", () => {
  const modifier = identityModifier();
  const { predicate, extractor } = modifier;

  test.each([
    // Existing patterns
    ["dated to 1850", "1850"],
    ["datable to early 19th century", "early 19th century"],
    ["datable to the 1930s", "1930s"],
    ["datable to the early 20th century", "early 20th century"],
    ["datable to the Renaissance period", "Renaissance period"],
    ["dated 1920", "1920"],
    ["dated 20th century", "20th century"],
    ["d a t e d 1900", "1900"],
    ["probably 1850-1900", "1850-1900"],
    ["possibly 19th century", "19th century"],
    ["likely early 20th century", "early 20th century"],
    ["suggested 1920-1930", "1920-1930"],
    ["check early 20th century", "early 20th century"],
    ["cast 1855", "1855"],
    ["1850, probably", "1850"],
    ["1920-1930, suggested", "1920-1930"],
    ["early 19th century, check", "early 19th century"],
    ["2323 B.C. probably", "2323 B.C."],
    ["1814 B.C. suggested", "1814 B.C."],
    ["1802 B.C. check", "1802 B.C."],
    ["patented 1920", "1920"],
    // New dated/undated patterns
    ["dated, 20th century", "20th century"],
    ["undated, 20th century", "20th century"],
    ["20th century, undated", "20th century"],
    ["dated, 1850-1900", "1850-1900"],
    ["undated, medieval period", "medieval period"],
    ["Renaissance era, undated", "Renaissance era"],
    // Published patterns
    ["published August 1836", "August 1836"],
    ["published mid-18th century", "mid-18th century"],
    ["published mid-19th century", "mid-19th century"],
    ["originally published 1880s", "1880s"],
    ["published 1920", "1920"],
    ["published early 20th century", "early 20th century"],
    ["originally published Renaissance period", "Renaissance period"],
    ["published in 1920", "1920"],
    ["publication 1920", "1920"],
    ["originally 1880s", "1880s"],
  ])(
    "predicate accepts and extractor processes '%s' -> '%s'",
    (input, expected) => {
      expect(predicate(input)).toBe(true);
      expect(extractor(input)).toBe(expected);
    }
  );

  test.each([
    "20th century", // no dating prefix/suffix
    "1850-1900", // no dating prefix/suffix
    "medieval period", // no dating prefix/suffix
    "Renaissance era", // no dating prefix/suffix
    "undated 20th century", // no comma
    "20th century undated", // no comma (not at end)
  ])("predicate rejects '%s'", (input) => {
    expect(predicate(input)).toBe(false);
  });
});
