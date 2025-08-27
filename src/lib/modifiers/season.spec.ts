import { seasonModifier } from "./season";

const YEAR_TESTS = [
  ["summer 2020", "2020", 2020, 2020],
  ["winter 2021", "2021", 2021, 2022],
  ["spring 2022", "2022", 2022, 2022],
  ["fall 2023", "2023", 2023, 2023],
  ["summer/fall 2024", "2024", 2024, 2024],
  ["fall/winter 2025", "2025", 2025, 2026],
  ["winter/spring 2026", "2026", 2025, 2026],
  ["spring/summer 2027", "2027", 2027, 2027],
  ["fall/winter 2027-28", "2027", 2027, 2028],
  ["spring & summer 2029", "2029", 2029, 2029],
  ["fall and winter 2030", "2030", 2030, 2031],
  ["spring of 2031", "2031", 2031, 2031],
  ["summer of 2032", "2032", 2032, 2032],
  ["winter & spring 2033", "2033", 2032, 2033],
] as const;

describe("seasonModifier - year calculations", () => {
  test.each(YEAR_TESTS)("predicate correctly identifies '%s'", (input) => {
    const result = seasonModifier().predicate(input);
    expect(result).toBe(true);
  });

  test.each(YEAR_TESTS)(
    "extractor correctly extracts years for '%s'",
    (input, extracted) => {
      const result = seasonModifier().extractor(input);
      expect(result).toEqual(extracted);
    }
  );
  test.each(YEAR_TESTS)(
    "correctly calculates years for '%s'",
    (input, extracted, startYear, endYear) => {
      const result = seasonModifier().transformer(
        [new Date(startYear, 0, 1), new Date(endYear, 0, 1)],
        input
      );
      expect(result[0].getFullYear()).toBe(startYear);
      expect(result[1].getFullYear()).toBe(endYear);
    }
  );
});
