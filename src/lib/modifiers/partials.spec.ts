import {
  firstHalfModifier,
  secondHalfModifier,
  middleHalfModifier,
  firstThirdModifier,
  secondThirdModifier,
  thirdThirdModifier,
  firstQuarterModifier,
  secondQuarterModifier,
  thirdQuarterModifier,
  fourthQuarterModifier,
} from "./partials";

describe("firstHalfModifier", () => {
  const modifier = firstHalfModifier();
  const { predicate, extractor } = modifier;

  test.each([
    ["first half of the 19th century", "19th century"],
    ["first half of 1989", "1989"],
    ["first half 1919", "1919"],
    ["first half 14th century", "14th century"],
    ["1st half of the 19th century", "19th century"],
    ["1st half of 1989", "1989"],
    ["1st half 1919", "1919"],
    ["1st half 14th century", "14th century"],
  ])(
    "predicate accepts and extractor processes '%s' -> '%s'",
    (input, expected) => {
      expect(predicate(input)).toBe(true);
      expect(extractor(input)).toBe(expected);
    }
  );

  test.each(["second half of the 19th century"])(
    "predicate rejects '%s'",
    (input) => {
      expect(predicate(input)).toBe(false);
    }
  );
});

describe("secondHalfModifier", () => {
  const modifier = secondHalfModifier();
  const { predicate, extractor } = modifier;

  test.each([
    ["second half of the 19th century", "19th century"],
    ["second half of 1989", "1989"],
    ["second half 1919", "1919"],
    ["second half 14th century", "14th century"],
    ["2nd half of the 19th century", "19th century"],
    ["2nd half of 1989", "1989"],
    ["2nd half 1919", "1919"],
    ["2nd half 14th century", "14th century"],
  ])(
    "predicate accepts and extractor processes '%s' -> '%s'",
    (input, expected) => {
      expect(predicate(input)).toBe(true);
      expect(extractor(input)).toBe(expected);
    }
  );

  test.each(["first half of the 19th century"])(
    "predicate rejects '%s'",
    (input) => {
      expect(predicate(input)).toBe(false);
    }
  );
});

describe("middleHalfModifier", () => {
  const modifier = middleHalfModifier();
  const { predicate, extractor } = modifier;

  test.each([
    ["middle half of the 19th century", "19th century"],
    ["middle half of 1989", "1989"],
    ["middle half 1989", "1989"],
    ["mid half of the 19th century", "19th century"],
    ["mid half 14th century", "14th century"],
  ])(
    "predicate accepts and extractor processes '%s' -> '%s'",
    (input, expected) => {
      expect(predicate(input)).toBe(true);
      expect(extractor(input)).toBe(expected);
    }
  );

  test.each(["first half of the 19th century"])(
    "predicate rejects '%s'",
    (input) => {
      expect(predicate(input)).toBe(false);
    }
  );
});

describe("firstThirdModifier", () => {
  const modifier = firstThirdModifier();
  const { predicate, extractor } = modifier;

  test.each([
    ["early 19th century", "19th century"],
    ["early 1989", "1989"],
    ["early medieval period", "medieval period"],
  ])(
    "predicate accepts and extractor processes '%s' -> '%s'",
    (input, expected) => {
      expect(predicate(input)).toBe(true);
      expect(extractor(input)).toBe(expected);
    }
  );

  test.each(["late 19th century"])("predicate rejects '%s'", (input) => {
    expect(predicate(input)).toBe(false);
  });
});

describe("secondThirdModifier", () => {
  const modifier = secondThirdModifier();
  const { predicate, extractor } = modifier;

  test.each([
    ["mid-19th century", "19th century"],
    ["mid 1989", "1989"],
    ["mid medieval period", "medieval period"],
  ])(
    "predicate accepts and extractor processes '%s' -> '%s'",
    (input, expected) => {
      expect(predicate(input)).toBe(true);
      expect(extractor(input)).toBe(expected);
    }
  );

  test.each(["early 19th century"])("predicate rejects '%s'", (input) => {
    expect(predicate(input)).toBe(false);
  });
});

describe("thirdThirdModifier", () => {
  const modifier = thirdThirdModifier();
  const { predicate, extractor } = modifier;

  test.each([
    ["late 19th century", "19th century"],
    ["late 1989", "1989"],
    ["late medieval period", "medieval period"],
  ])(
    "predicate accepts and extractor processes '%s' -> '%s'",
    (input, expected) => {
      expect(predicate(input)).toBe(true);
      expect(extractor(input)).toBe(expected);
    }
  );

  test.each(["mid-19th century"])("predicate rejects '%s'", (input) => {
    expect(predicate(input)).toBe(false);
  });
});

describe("firstQuarterModifier", () => {
  const modifier = firstQuarterModifier();
  const { predicate, extractor } = modifier;

  test.each([
    ["first quarter of the 19th century", "19th century"],
    ["first quarter of 1989", "1989"],
    ["first quarter 1989", "1989"],
    ["1st quarter of the medieval period", "medieval period"],
  ])(
    "predicate accepts and extractor processes '%s' -> '%s'",
    (input, expected) => {
      expect(predicate(input)).toBe(true);
      expect(extractor(input)).toBe(expected);
    }
  );

  test.each(["second quarter of the 19th century"])(
    "predicate rejects '%s'",
    (input) => {
      expect(predicate(input)).toBe(false);
    }
  );
});

describe("secondQuarterModifier", () => {
  const modifier = secondQuarterModifier();
  const { predicate, extractor } = modifier;

  test.each([
    ["second quarter of the 19th century", "19th century"],
    ["second quarter of 1989", "1989"],
    ["second quarter 1989", "1989"],
    ["2nd quarter of the medieval period", "medieval period"],
  ])(
    "predicate accepts and extractor processes '%s' -> '%s'",
    (input, expected) => {
      expect(predicate(input)).toBe(true);
      expect(extractor(input)).toBe(expected);
    }
  );

  test.each(["third quarter of the 19th century"])(
    "predicate rejects '%s'",
    (input) => {
      expect(predicate(input)).toBe(false);
    }
  );
});

describe("thirdQuarterModifier", () => {
  const modifier = thirdQuarterModifier();
  const { predicate, extractor } = modifier;

  test.each([
    ["third quarter of the 19th century", "19th century"],
    ["third quarter of 1989", "1989"],
    ["third quarter 1989", "1989"],
    ["3rd quarter of the medieval period", "medieval period"],
  ])(
    "predicate accepts and extractor processes '%s' -> '%s'",
    (input, expected) => {
      expect(predicate(input)).toBe(true);
      expect(extractor(input)).toBe(expected);
    }
  );

  test.each(["fourth quarter of the 19th century"])(
    "predicate rejects '%s'",
    (input) => {
      expect(predicate(input)).toBe(false);
    }
  );
});

describe("fourthQuarterModifier", () => {
  const modifier = fourthQuarterModifier();
  const { predicate, extractor } = modifier;

  test.each([
    ["fourth quarter of the 19th century", "19th century"],
    ["fourth quarter of 1989", "1989"],
    ["fourth quarter 1989", "1989"],
    ["4th quarter of the medieval period", "medieval period"],
    ["last quarter of the 19th century", "19th century"],
  ])(
    "predicate accepts and extractor processes '%s' -> '%s'",
    (input, expected) => {
      expect(predicate(input)).toBe(true);
      expect(extractor(input)).toBe(expected);
    }
  );

  test.each(["first quarter of the 19th century"])(
    "predicate rejects '%s'",
    (input) => {
      expect(predicate(input)).toBe(false);
    }
  );
});
