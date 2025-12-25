import { matchEraRange, matchYearShorthand } from "./year";

describe("matchYearShorthand", () => {
  test.each([
    ["1994-7", ["1994", "1997"]],
    ["1920-25", ["1920", "1925"]],
    ["994-7", ["994", "997"]],
    ["920-25", ["920", "925"]],
    ["1994–7", ["1994", "1997"]],
    ["1994—7", ["1994", "1997"]],
    ["1994/7", ["1994", "1997"]],
    ["1760?–70", ["1760", "1770"]],
    ["1720?–?25", ["1720", "1725"]],
    ["1705–?15", ["1705", "1715"]],
    ["1740?—?50", ["1740", "1750"]],
    ["1730?–?40", ["1730", "1740"]],
    ["1735?‒?45", ["1735", "1745"]],
    ["1715 ? – ? 20", ["1715", "1720"]],
    ["1800?–?25", ["1800", "1825"]],
    ["ca. 1909-27", ["ca. 1909", "1927"]],
    ["after 1920-25", ["after 1920", "1925"]],
    ["ca. after 1850-55", ["ca. after 1850", "1855"]],
    ["1925-20", ["1925", "2020"]],
    ["5-7", ["5", "7"]],
    ["20-5", ["20", "25"]],
    ["2000-05", ["2000", "2005"]],
    ["1999-02", ["1999", "2002"]],
  ])("should return %s for input %s", (input, expected) => {
    expect(matchYearShorthand(input)).toEqual(expected);
  });

  test.each([
    ["1920-20"],
    ["1920-1925"],
    ["early-late"],
    ["1920-late"],
    ["1920"],
    ["1920-25-30"],
  ])("should return null for input %s", (input) => {
    expect(matchYearShorthand(input)).toBeNull();
  });
});

describe("matchEraRange", () => {
  test.each([
    ["1999-2000 ad", ["1999 ad", "2000 ad"]],
    ["1999-2000 b. c.", ["1999 b. c.", "2000 b. c."]],
    ["1999-2000 bc", ["1999 bc", "2000 bc"]],
    ["1999-2000 b.c.", ["1999 b.c.", "2000 b.c."]],
    ["ca. 1961–1917 b.c. or later", ["ca. 1961 b.c.", "1917 b.c. or later"]],
    ["1961–1917 b.c. or later", ["1961 b.c.", "1917 b.c. or later"]],
  ])("should split %s into %s", (input, expected) => {
    expect(matchEraRange(input)).toEqual(expected);
  });
});
