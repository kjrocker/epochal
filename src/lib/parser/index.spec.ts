import { TimePrecision } from "../types";
import { parseSingleDate as parse } from "./index";

describe("parser start", () => {
  it("handles undefined", () => {
    const actual = parse(undefined);
    expect(actual).toBe(undefined);
  });

  test.each(["4th c"])(
    "parses unknown or ambiguous dates as undefined",
    (str) => {
      const single = parse(str);
      expect(single).toBe(undefined);
    }
  );

  const testCases = [
    ["1234", { year: 1234 }],
    [" 1234   ", { year: 1234 }],
    ["1234/10", { year: 1234, month: 10 }],
    ["1234/10/1", { year: 1234, month: 10, day: 1 }],
    ["Jan 2011", { year: 2011, month: 1 }],
    ["February 2011", { year: 2011, month: 2 }],
    ["Mar 13 2011", { year: 2011, month: 3, day: 13 }],
    ["April 13 2011", { year: 2011, month: 4, day: 13 }],
    ["Jun. 13, 2011", { year: 2011, month: 6, day: 13 }],
    ["May 13, 2011", { year: 2011, month: 5, day: 13 }],
    ["Jul. 13th, 2011", { year: 2011, month: 7, day: 13 }],
    ["Aug 13th, 2011", { year: 2011, month: 8, day: 13 }],
    ["Sep 13th 2011", { year: 2011, month: 9, day: 13 }],
    ["October 13, 2011", { year: 2011, month: 10, day: 13 }],
    ["November 13th, 2011", { year: 2011, month: 11, day: 13 }],
    ["December 13th 2011", { year: 2011, month: 12, day: 13 }],
    ["december 13th 2011", { year: 2011, month: 12, day: 13 }],
    ["11 Dec 2011", { year: 2011, month: 12, day: 11 }],
    ["11 December 2011", { year: 2011, month: 12, day: 11 }],
    ["4 century", { year: 350, precision: TimePrecision.CENTURY }],
    ["4 millenium", { year: 3500, precision: TimePrecision.MILLENIUM }],
    ["4th century", { year: 350, precision: TimePrecision.CENTURY }],
    ["4th millenium", { year: 3500, precision: TimePrecision.MILLENIUM }],
    ["340s", { year: 343, precision: TimePrecision.DECADE }],
  ] as const;

  test.each(testCases)("parses '%s' correctly with in CE/AD", (str, start) => {
    const actualWithCE = parse(`${str} CE`);
    expect(actualWithCE).toEqual(
      expect.objectContaining({ ...start, era: "CE" })
    );

    const actualWithAD = parse(`${str} AD`);
    expect(actualWithAD).toEqual(
      expect.objectContaining({ ...start, era: "CE" })
    );
  });

  test.each(testCases)("parses '%s' correctly with in BC/BCE", (str, start) => {
    const actualWithCE = parse(`${str} BCE`);
    expect(actualWithCE).toEqual(
      expect.objectContaining({ ...start, era: "BCE" })
    );

    const actualWithAD = parse(`${str} BC`);
    expect(actualWithAD).toEqual(
      expect.objectContaining({ ...start, era: "BCE" })
    );
  });

  test.each(testCases)("parses '%s' correctly with in bc/bce", (str, start) => {
    const lowerActualWithBCE = parse(`${str} bce`);
    expect(lowerActualWithBCE).toEqual(
      expect.objectContaining({ ...start, era: "BCE" })
    );

    const lowerActualWithBC = parse(`${str} bc`);
    expect(lowerActualWithBC).toEqual(
      expect.objectContaining({ ...start, era: "BCE" })
    );
  });

  test.each(testCases)("parses '%s' correctly with in ad/ce", (str, start) => {
    const lowerActualWithCE = parse(`${str} ce`);
    expect(lowerActualWithCE).toEqual(
      expect.objectContaining({ ...start, era: "CE" })
    );

    const lowerActualWithAD = parse(`${str} ad`);
    expect(lowerActualWithAD).toEqual(
      expect.objectContaining({ ...start, era: "CE" })
    );
  });

  test.each(testCases)("parses start '%s' correctly", (str, start) => {
    const actual = parse(str);
    expect(actual).toEqual(expect.objectContaining(start));
  });
});
