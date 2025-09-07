import {
  earlyMidLateModifier,
  firstHalfModifier,
  firstQuarterModifier,
  fourthQuarterModifier,
  middleHalfModifier,
  secondHalfModifier,
  secondQuarterModifier,
  thirdQuarterModifier,
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
    ["last half of the 19th century", "19th century"],
    ["last half of 1989", "1989"],
    ["end of the 19th century", "19th century"],
    ["end of 1989", "1989"],
    ["last half 1919", "1919"],
    ["last half 14th century", "14th century"],
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

describe("earlyMidLateModifier", () => {
  const modifier = earlyMidLateModifier();
  const { predicate, extractor, transformer } = modifier;

  // Test dates: January 1 to December 31, 2000
  const testDates: [Date, Date] = [
    new Date(2000, 0, 1), // Jan 1, 2000
    new Date(2000, 11, 31), // Dec 31, 2000
  ];

  describe("predicate", () => {
    test.each([
      // Range patterns
      "early to mid 19th century",
      "early to late 1800s",
      "mid-to-late 20th century",
      "early-mid 1900s",
      "mid-late 1850s",
      "early to mid-1800s",
      "mid to late 19th century",
      "early mid 1900s",
      "mid late 1950s",
      // Singular patterns (from existing modifiers)
      "early 19th century",
      "early 1989",
      "early medieval period",
      "mid-19th century",
      "mid 1989",
      "mid medieval period",
      "late 19th century",
      "late 1989",
      "late medieval period",
    ])("accepts '%s'", (input) => {
      expect(predicate(input)).toBe(true);
    });

    test.each([
      "19th century",
      "1800s",
      "beginning to end 1900s",
      "start to finish 1850s",
      "first half 1900s",
      "second quarter 1800s",
    ])("rejects '%s'", (input) => {
      expect(predicate(input)).toBe(false);
    });
  });

  describe("extractor", () => {
    test.each([
      // Range patterns
      ["early to mid 19th century", "19th century"],
      ["early to late 1800s", "1800s"],
      ["mid-to-late 20th century", "20th century"],
      ["early-mid 1900s", "1900s"],
      ["mid-late 1850s", "1850s"],
      ["early to mid-1800s", "1800s"],
      ["mid to late 19th century", "19th century"],
      // Singular patterns (from existing modifiers)
      ["early 19th century", "19th century"],
      ["early 1989", "1989"],
      ["early medieval period", "medieval period"],
      ["mid-19th century", "19th century"],
      ["mid 1989", "1989"],
      ["mid medieval period", "medieval period"],
      ["late 19th century", "19th century"],
      ["late 1989", "1989"],
      ["late medieval period", "medieval period"],
    ])("extracts '%s' -> '%s'", (input, expected) => {
      expect(extractor(input)).toBe(expected);
    });
  });

  describe("transformer", () => {
    // Helper to get thirds of the test date range
    const getThirds = () => {
      const diff = testDates[1].getTime() - testDates[0].getTime();
      const third = diff / 3;
      return [
        testDates[0], // start
        new Date(testDates[0].getTime() + third), // end of first third
        new Date(testDates[0].getTime() + 2 * third), // end of second third
        testDates[1], // end
      ];
    };

    it("transforms 'early to mid' patterns to start through middle third", () => {
      const [start, firstThird, secondThird] = getThirds();

      expect(transformer(testDates, "early to mid 1900s")).toEqual([
        start,
        secondThird,
      ]);
      expect(transformer(testDates, "early-mid 1900s")).toEqual([
        start,
        secondThird,
      ]);
    });

    it("transforms 'early to late' patterns to full range", () => {
      const [start, , , end] = getThirds();

      expect(transformer(testDates, "early to late 1900s")).toEqual([
        start,
        end,
      ]);
    });

    it("transforms 'mid to late' patterns to middle third through end", () => {
      const [, firstThird, , end] = getThirds();

      expect(transformer(testDates, "mid-to-late 1900s")).toEqual([
        firstThird,
        end,
      ]);
      expect(transformer(testDates, "mid-late 1900s")).toEqual([
        firstThird,
        end,
      ]);
    });

    it("transforms 'early' patterns to first third", () => {
      const [start, firstThird] = getThirds();

      expect(transformer(testDates, "early 1900s")).toEqual([
        start,
        firstThird,
      ]);
    });

    it("transforms 'mid' patterns to middle third", () => {
      const [, firstThird, secondThird] = getThirds();

      expect(transformer(testDates, "mid-1900s")).toEqual([
        firstThird,
        secondThird,
      ]);
      expect(transformer(testDates, "mid 1900s")).toEqual([
        firstThird,
        secondThird,
      ]);
    });

    it("transforms 'late' patterns to last third", () => {
      const [, , secondThird, end] = getThirds();

      expect(transformer(testDates, "late 1900s")).toEqual([secondThird, end]);
    });

    it("returns original dates for unmatched patterns", () => {
      expect(transformer(testDates, "unknown pattern")).toEqual(testDates);
    });
  });

  describe("integration", () => {
    test.each([
      {
        input: "early to mid 19th century",
        expectedText: "19th century",
        description: "should extract text and transform dates for early to mid",
      },
      {
        input: "mid-to-late 1800s",
        expectedText: "1800s",
        description: "should extract text and transform dates for mid to late",
      },
      {
        input: "early to late 20th century",
        expectedText: "20th century",
        description:
          "should extract text and transform dates for early to late",
      },
      {
        input: "early 19th century",
        expectedText: "19th century",
        description: "should extract text and transform dates for early",
      },
      {
        input: "mid-1900s",
        expectedText: "1900s",
        description: "should extract text and transform dates for mid",
      },
      {
        input: "late medieval period",
        expectedText: "medieval period",
        description: "should extract text and transform dates for late",
      },
    ])("$description", ({ input, expectedText }) => {
      expect(predicate(input)).toBe(true);
      expect(extractor(input)).toBe(expectedText);

      const result = transformer(testDates, input);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Date);
      expect(result[1]).toBeInstanceOf(Date);
      expect(result[0].getTime()).toBeLessThanOrEqual(result[1].getTime());
    });
  });
});
