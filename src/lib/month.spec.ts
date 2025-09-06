import { ordinalMonthAndYear } from "./month";
import { DEFAULT_OPTIONS } from "./util/options";

describe("ordinalMonthAndYear", () => {
  const defaultOptions = DEFAULT_OPTIONS;

  test.each([
    ["1st month, 1919", { month: 1, year: 1919 }],
    ["2nd month, 2024", { month: 2, year: 2024 }],
    ["3rd month, 1500", { month: 3, year: 1500 }],
    ["4th month, 1999", { month: 4, year: 1999 }],
    ["12th month, 2000", { month: 12, year: 2000 }],
    ["11th month, 1", { month: 11, year: 1 }],
    ["1st month, 9999", { month: 1, year: 9999 }],
    ["5th month 1999", { month: 5, year: 1999 }],
    ["6th month,1999", { month: 6, year: 1999 }],
    ["7th month  ,  1999", { month: 7, year: 1999 }],
    ["1st month, 100 BC", { month: 1, year: -99 }],
    ["1st month, 100 AD", { month: 1, year: 100 }],
    ["2nd month, 50 bc", { month: 2, year: -49 }],
    // Year-first format
    ["1774, 2nd month", { month: 2, year: 1774 }],
    ["1820, 12th month", { month: 12, year: 1820 }],
    ["500 BC, 3rd month", { month: 3, year: -499 }],
    // Ordinal word formats
    ["first month, 1790", { month: 1, year: 1790 }],
    ["second month, 1785", { month: 2, year: 1785 }],
    ["eighth month, 1859", { month: 8, year: 1859 }],
    ["twelfth month, 1900", { month: 12, year: 1900 }],
    // Year-first ordinal word formats  
    ["1790, first month", { month: 1, year: 1790 }],
    ["1784, first month", { month: 1, year: 1784 }],
    ["1801, first month", { month: 1, year: 1801 }],
    ["1859, eighth month", { month: 8, year: 1859 }],
    ["1789, eighth month", { month: 8, year: 1789 }],
    ["1850, eleventh month", { month: 11, year: 1850 }],
  ])("should parse '%s'", (input, expected) => {
    const result = ordinalMonthAndYear(input.toLowerCase(), defaultOptions);
    expect(result).toEqual(expected);
  });

  test.each([
    "not a date",
    "13th month, 1999", // Invalid month
    "0th month, 1999", // Invalid month
    "21st month, 1999", // Invalid month
    "1st day, 1999", // Wrong unit
    "thirteenth month, 1999", // Invalid ordinal word
    "zeroth month, 1999", // Invalid ordinal word
    "first day, 1999", // Wrong unit with ordinal word
    "",
  ])("should return null for invalid input: '%s'", (input) => {
    const result = ordinalMonthAndYear(input.toLowerCase(), defaultOptions);
    expect(result).toBeNull();
  });
});
