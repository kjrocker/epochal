import { epochize } from "./index";
import { epochizeTuple } from "./lib/v2";

describe("Timezones", () => {
  it("should always be UTC", () => {
    expect(new Date().getTimezoneOffset()).toBe(0);
  });
});

const MILLENIUM_TEST_CASES = [
  [
    "12nd millenium BC",
    "-011999-01-01T00:00:00.000Z",
    "-011000-12-31T23:59:59.999Z",
  ],
  [
    "2nd millenium BC",
    "-001999-01-01T00:00:00.000Z",
    "-001000-12-31T23:59:59.999Z",
  ],
  [
    "1st millenium BC",
    "-000999-01-01T00:00:00.000Z",
    "0000-12-31T23:59:59.999Z",
  ],
  ["1st millenium", "0001-01-01T00:00:00.000Z", "1000-12-31T23:59:59.999Z"],
  ["2nd millennium", "1001-01-01T00:00:00.000Z", "2000-12-31T23:59:59.999Z"],
  ["2nd millenium", "1001-01-01T00:00:00.000Z", "2000-12-31T23:59:59.999Z"],
  ["3nd millenium", "2001-01-01T00:00:00.000Z", "3000-12-31T23:59:59.999Z"],
  ["1st millenium AD", "0001-01-01T00:00:00.000Z", "1000-12-31T23:59:59.999Z"],
  ["2nd millennium AD", "1001-01-01T00:00:00.000Z", "2000-12-31T23:59:59.999Z"],
  ["2nd millenium AD", "1001-01-01T00:00:00.000Z", "2000-12-31T23:59:59.999Z"],
  ["3nd millenium AD", "2001-01-01T00:00:00.000Z", "3000-12-31T23:59:59.999Z"],
  [
    "12nd millenium AD",
    "+011001-01-01T00:00:00.000Z",
    "+012000-12-31T23:59:59.999Z",
  ],
];

const CENTURY_TEST_CASES = [
  [
    "12nd century BC",
    "-001199-01-01T00:00:00.000Z",
    "-001100-12-31T23:59:59.999Z",
  ],
  [
    "2nd century BC",
    "-000199-01-01T00:00:00.000Z",
    "-000100-12-31T23:59:59.999Z",
  ],
  ["1st century BC", "-000099-01-01T00:00:00.000Z", "0000-12-31T23:59:59.999Z"],
  ["1st century", "0001-01-01T00:00:00.000Z", "0100-12-31T23:59:59.999Z"],
  ["2st century", "0101-01-01T00:00:00.000Z", "0200-12-31T23:59:59.999Z"],
  ["21st century", "2001-01-01T00:00:00.000Z", "2100-12-31T23:59:59.999Z"],
];

const YEAR_TEST_CASES = [
  ["151515 BC", "-151514-01-01T00:00:00.000Z", "-151514-12-31T23:59:59.999Z"],
  ["232 BC", "-000231-01-01T00:00:00.000Z", "-000231-12-31T23:59:59.999Z"],
  ["2 BC", "-000001-01-01T00:00:00.000Z", "-000001-12-31T23:59:59.999Z"],
  ["1 BC", "0000-01-01T00:00:00.000Z", "0000-12-31T23:59:59.999Z"],
  ["1", "0001-01-01T00:00:00.000Z", "0001-12-31T23:59:59.999Z"],
  ["2", "0002-01-01T00:00:00.000Z", "0002-12-31T23:59:59.999Z"],
  ["34", "0034-01-01T00:00:00.000Z", "0034-12-31T23:59:59.999Z"],
  ["199", "0199-01-01T00:00:00.000Z", "0199-12-31T23:59:59.999Z"],
];

const DECADE_TEST_CASES = [
  ["20s BC", "-000028-01-01T00:00:00.000Z", "-000019-12-31T23:59:59.999Z"],
  ["10s BC", "-000018-01-01T00:00:00.000Z", "-000009-12-31T23:59:59.999Z"],
  ["00s BC", "-000008-01-01T00:00:00.000Z", "0000-12-31T23:59:59.999Z"],
  ["00s", "0001-01-01T00:00:00.000Z", "0009-12-31T23:59:59.999Z"],
  ["10s", "0010-01-01T00:00:00.000Z", "0019-12-31T23:59:59.999Z"],
  ["20s", "0020-01-01T00:00:00.000Z", "0029-12-31T23:59:59.999Z"],
  ["1800s", "1800-01-01T00:00:00.000Z", "1809-12-31T23:59:59.999Z"],
  ["2240s", "2240-01-01T00:00:00.000Z", "2249-12-31T23:59:59.999Z"],
];

const MONTH_TEST_CASES = [
  ["92/3", "0092-03-01T00:00:00.000Z", "0092-03-31T23:59:59.999Z"],
  // ["3/92 BC", "-000091-03-01T00:00:00.000Z", "-000091-03-31T23:59:59.999Z"],
  ["1/12 BC", "0000-12-01T00:00:00.000Z", "0000-12-31T23:59:59.999Z"],
  ["1/1", "0001-01-01T00:00:00.000Z", "0001-01-31T23:59:59.999Z"],
  ["1/12 BC", "0000-12-01T00:00:00.000Z", "0000-12-31T23:59:59.999Z"],
  ["December 1 BC", "0000-12-01T00:00:00.000Z", "0000-12-31T23:59:59.999Z"],
  ["January 1", "0001-01-01T00:00:00.000Z", "0001-01-31T23:59:59.999Z"],
  ["Dec 1 BC", "0000-12-01T00:00:00.000Z", "0000-12-31T23:59:59.999Z"],
  ["Jan 1", "0001-01-01T00:00:00.000Z", "0001-01-31T23:59:59.999Z"],
  ["Jan 2001", "2001-01-01T00:00:00.000Z", "2001-01-31T23:59:59.999Z"],
];

const DAY_TEST_CASES = [
  ["Dec 31 1 BC", "0000-12-31T00:00:00.000Z", "0000-12-31T23:59:59.999Z"],
  ["Jan 1 1", "0001-01-01T00:00:00.000Z", "0001-01-01T23:59:59.999Z"],
  ["December 31 1 BC", "0000-12-31T00:00:00.000Z", "0000-12-31T23:59:59.999Z"],
  ["January 1 1", "0001-01-01T00:00:00.000Z", "0001-01-01T23:59:59.999Z"],
  ["1/12/31 BC", "0000-12-31T00:00:00.000Z", "0000-12-31T23:59:59.999Z"],
  ["1/1/1", "0001-01-01T00:00:00.000Z", "0001-01-01T23:59:59.999Z"],
  ["1001/3/12", "1001-03-12T00:00:00.000Z", "1001-03-12T23:59:59.999Z"],
  ["Jan 1 2000", "2000-01-01T00:00:00.000Z", "2000-01-01T23:59:59.999Z"],
];

describe("parser", () => {
  it("handles undefined", () => {
    // @ts-expect-error
    const actual = epochize(undefined);
    expect(actual).toBe(null);
  });

  test.each(MILLENIUM_TEST_CASES)(
    `millennium - parses '%s' correctly`,
    (input, expectedStart, expectedEnd) => {
      const [start, end] = epochize(input)!;
      expect(start.toISOString()).toBe(expectedStart);
      expect(end.toISOString()).toBe(expectedEnd);
    }
  );

  test.each(CENTURY_TEST_CASES)(
    `century - parses '%s' correctly`,
    (input, expectedStart, expectedEnd) => {
      const [start, end] = epochize(input)!;
      expect(start.toISOString()).toBe(expectedStart);
      expect(end.toISOString()).toBe(expectedEnd);
    }
  );

  test.each(YEAR_TEST_CASES)(
    `year - parses '%s' correctly`,
    (input, expectedStart, expectedEnd) => {
      const [start, end] = epochize(input)!;
      expect(start.toISOString()).toBe(expectedStart);
      expect(end.toISOString()).toBe(expectedEnd);
    }
  );

  test.each(DECADE_TEST_CASES)(
    `decade - parses '%s' correctly`,
    (input, expectedStart, expectedEnd) => {
      const [start, end] = epochize(input)!;
      expect(start.toISOString()).toBe(expectedStart);
      expect(end.toISOString()).toBe(expectedEnd);
    }
  );

  test.each(MONTH_TEST_CASES)(
    `month - parses '%s' correctly`,
    (input, expectedStart, expectedEnd) => {
      const result = epochizeTuple(input)!;
      const [start, end] = result.value;
      expect(result.metadata.handler).toBe("handleMonth");
      expect(start.toISOString()).toBe(expectedStart);
      expect(end.toISOString()).toBe(expectedEnd);
    }
  );

  test.each(DAY_TEST_CASES)(
    `day - parses '%s' correctly`,
    (input, expectedStart, expectedEnd) => {
      const result = epochizeTuple(input)!;
      const [start, end] = result.value;
      expect(result.metadata.handler).toBe("handleDay");
      expect(start.toISOString()).toBe(expectedStart);
      expect(end.toISOString()).toBe(expectedEnd);
    }
  );
});
