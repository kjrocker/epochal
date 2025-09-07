import { handleYearListRange } from "./year-list";
import { Maybe } from "../util/maybe";

describe("handleYearListRange", () => {
  const defaultOptions = {
    centuryBreakpoint: 50,
    centuryShorthand: false,
    convention: "popular" as const,
    circaStartOffset: 3,
    circaEndOffset: 0,
    afterOffset: 10,
  };

  test.each([
    // Individual year lists  
    ["1704, 1708", 1704, 1708],
    ["1704, 1708, 1701", 1701, 1708],
    ["1704, 1708, 1710", 1704, 1710],
    ["1700, 1707", 1700, 1707],
    ["1700, 1704, 1702", 1700, 1704],
    ["1850, 1860, 1855", 1850, 1860],
    ["2000, 1999, 2001", 1999, 2001],
    
    // Basic shorthand range lists
    ["1920-25, 1930-35", 1920, 1935],
    ["1900-05, 1910-15, 1907-12", 1900, 1915],
    ["1910-15, 1900-05, 1907-12", 1900, 1915],
    ["1850-55, 1851-56, 1852-57, 1849-54", 1849, 1857],

    // Single shorthand range
    ["1920-25", 1920, 1925],
    ["1800-05", 1800, 1805],
    ["1999-03", 1999, 2003],

    // Duplicate ranges
    ["1920-25, 1920-25, 1930-35", 1920, 1935],
    ["1900-05, 1900-05", 1900, 1905],

    // Various formatting
    ["1920-25,1930-35", 1920, 1935],
    ["1920-25 , 1930-35", 1920, 1935],
    ["1920-25  ,  1930-35", 1920, 1935],
    [" 1920-25, 1930-35 ", 1920, 1935],

    // More complex lists
    ["1880-85, 1890-95, 1900-05, 1910-15", 1880, 1915],
    ["1950-55, 1960-65, 1970-75", 1950, 1975],
    ["1800-05, 1810-15, 1820-25, 1830-35, 1840-45", 1800, 1845],
  ])(
    "should handle shorthand range list: %s",
    (input, expectedStart, expectedEnd) => {
      const result = handleYearListRange(
        Maybe.fromValue(input),
        defaultOptions
      );
      const dateRange = result.get();

      expect(dateRange).toBeTruthy();
      if (dateRange) {
        expect(dateRange[0]).toBeInstanceOf(Date);
        expect(dateRange[1]).toBeInstanceOf(Date);
        expect(dateRange[0].getFullYear()).toBe(expectedStart);
        expect(dateRange[1].getFullYear()).toBe(expectedEnd);
        expect(dateRange[0].getTime()).toBeLessThanOrEqual(
          dateRange[1].getTime()
        );

        // Check metadata
        expect(dateRange[2]).toBeDefined();
        expect(dateRange[2].handler).toEqual(["handleRange"]);
      }
    }
  );

  describe("edge cases that return null", () => {
    test.each([
      [""], // empty string
      ["abc-def, xyz-123"], // invalid ranges
      ["1920-25, abc-def"], // mixed valid/invalid
      ["1920"], // single year (less than 2 items)
      ["not a date"], // completely invalid
      ["12345"], // 5-digit year
      ["abc"], // non-numeric
    ])("should return null for: %s", (input) => {
      const result = handleYearListRange(
        Maybe.fromValue(input),
        defaultOptions
      );
      expect(result.get()).toBeNull();
    });
  });
});
