import { epochize } from "./index";

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
});
