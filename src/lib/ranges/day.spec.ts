import { matchDayRange } from "./day";

describe("matchDayRange", () => {
  test.each([
    ["January 12-19, 1920", "January 12, 1920", "January 19, 1920"],
    ["February 3-8, 1985", "February 3, 1985", "February 8, 1985"],
    ["March 1-15, 2000", "March 1, 2000", "March 15, 2000"],
    ["December 20-31, 1999", "December 20, 1999", "December 31, 1999"],
    ["April 5-12, 1776", "April 5, 1776", "April 12, 1776"],
    ["May 28-30, 1453", "May 28, 1453", "May 30, 1453"],
    ["June 1-7, 44 bc", "June 1, 44 bc", "June 7, 44 bc"],
    ["July 14-21, 1789 ad", "July 14, 1789 ad", "July 21, 1789 ad"],
    // ["February 23 and/or 25, 1938", "February 23, 1938", "February 25, 1938"],
  ])("splits %s into %s and %s", (input, start, end) => {
    const result = matchDayRange(input);
    expect(result).toEqual([start, end]);
  });

  test.each([
    ["January 12, 1920", "single day"],
    ["1920-1925", "year range without days"],
    ["early January", "non-day patterns"],
    ["January 1920", "month-year without day"],
  ])("should return null for %s: %s", (input) => {
    const result = matchDayRange(input);
    expect(result).toBeNull();
  });

  test.each([
    ["January 12-19, 1920", "hyphens"],
    ["January 12–19, 1920", "en-dashes"],
    ["January 12—19, 1920", "em-dashes"],
  ])("should work with %s (%s)", (input) => {
    const result = matchDayRange(input);
    expect(result).toEqual(["January 12, 1920", "January 19, 1920"]);
  });
});
