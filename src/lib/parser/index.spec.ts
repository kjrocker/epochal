import format from "date-fns/format";
import fc from "fast-check";
import { parseTextToDate } from ".";

const Decade_Century_Millenium_TestCases = [
  // Decades BC/AD Transition
  ["20s BC", "0029-01-01 00:00:00 BC", "0020-12-31 23:59:59 BC"],
  ["10s BC", "0019-01-01 00:00:00 BC", "0010-12-31 23:59:59 BC"],
  ["0s BC", "0009-01-01 00:00:00 BC", "0001-12-31 23:59:59 BC"],
  ["0s", "0001-01-01 00:00:00 AD", "0009-12-31 23:59:59 AD"],
  ["10s", "0010-01-01 00:00:00 AD", "0019-12-31 23:59:59 AD"],
  ["20s", "0020-01-01 00:00:00 AD", "0029-12-31 23:59:59 AD"],
  // Extreme Outlier Decades
  ["1690s BC", "1699-01-01 00:00:00 BC", "1690-12-31 23:59:59 BC"],
  ["4230s", "4230-01-01 00:00:00 AD", "4239-12-31 23:59:59 AD"],
  // Centuries BC/AD Transition
  ["2nd century BC", "0200-01-01 00:00:00 BC", "0101-12-31 23:59:59 BC"],
  ["1st century BC", "0100-01-01 00:00:00 BC", "0001-12-31 23:59:59 BC"],
  ["1st century", "0001-01-01 00:00:00 AD", "0100-12-31 23:59:59 AD"],
  ["2nd century", "0101-01-01 00:00:00 AD", "0200-12-31 23:59:59 AD"],
  // Extreme Outlier Centuries
  // ["130th century BC", "13000-01-01 00:00:00 BC", "12901-12-31 23:59:59 BC"],
  // ["130th century", "12901-01-01 00:00:00 AD", "13000-12-31 23:59:59 AD"],
  // Other Century Formats
  ["2 cen BC", "0200-01-01 00:00:00 BC", "0101-12-31 23:59:59 BC"],
  ["1 century BC", "0100-01-01 00:00:00 BC", "0001-12-31 23:59:59 BC"],
  ["1 century", "0001-01-01 00:00:00 AD", "0100-12-31 23:59:59 AD"],
  ["2 cen", "0101-01-01 00:00:00 AD", "0200-12-31 23:59:59 AD"],
  // Millenia BC/AD Transition
  ["2nd millenium BC", "2000-01-01 00:00:00 BC", "1001-12-31 23:59:59 BC"],
  ["1st millenium BC", "1000-01-01 00:00:00 BC", "0001-12-31 23:59:59 BC"],
  ["1st millenium", "0001-01-01 00:00:00 AD", "1000-12-31 23:59:59 AD"],
  ["2nd millenium", "1001-01-01 00:00:00 AD", "2000-12-31 23:59:59 AD"],
  // Extreme Outlier Millenia
  // ["12th millenium BC", "12000-01-01 00:00:00 BC", "11001-12-31 23:59:59 BC"],
  // ["12th millenium", "11001-01-01 00:00:00 AD", "12000-12-31 23:59:59 AD"],
  // Other Millenium Formats
  ["2 mil BC", "2000-01-01 00:00:00 BC", "1001-12-31 23:59:59 BC"],
  ["1 millenium BC", "1000-01-01 00:00:00 BC", "0001-12-31 23:59:59 BC"],
  ["1 m", "0001-01-01 00:00:00 AD", "1000-12-31 23:59:59 AD"],
  ["2 mil", "1001-01-01 00:00:00 AD", "2000-12-31 23:59:59 AD"],
];

xdescribe(parseTextToDate.name, () => {
  test.each(Decade_Century_Millenium_TestCases)(
    `handles: %s`,
    (input, expectedStart, expectedEnd) => {
      const [start, end] = parseTextToDate(input)!;
      expect(format(start, "yyyy-MM-dd HH:mm:ss GG")).toBe(expectedStart);
      expect(format(end, "yyyy-MM-dd HH:mm:ss GG")).toBe(expectedEnd);
    }
  );

  describe("formats", () => {
    // A list of formats for year, month, and day level testing.
    const TEST_FORMATS = [
      "yyyy",
      "yyyy/MM",
      "yyyy/MM/dd",
      "MMM yyyy",
      "MMMM yyyy",
      "MMM do yyyy",
      "MMM dd yyyy",
      "MMMM do yyyy",
      "MMMM dd yyyy",
      "dd MMM yyyy",
      "dd MMMM yyyy",
    ] as const;

    it("handles CE era strings", () => {
      fc.assert(
        fc.property(
          fc.date({
            min: new Date("0001-01-01 00:00:00"),
            max: new Date("9999-12-31 23:59:59"),
          }),
          fc.constantFrom(...TEST_FORMATS),
          fc.constantFrom("", "AD", "CE", "ad", "ce"),
          (d, fmt, era) => {
            /**
             * This test is a bit of a hack. Basically, "1994" should give us
             * a start and end date that, formatted 'yyyy', will also be "1994".
             *
             * This ensures that July 1st formatted a certain way doesn't drift
             * into June 30th or something.
             */
            const result = parseTextToDate(`${format(d, fmt)} ${era}`)!;
            expect(result).toBeDefined();
            expect(format(result[0], fmt)).toBe(format(d, fmt));
            expect(format(result[1], fmt)).toBe(format(d, fmt));
          }
        ),
        { numRuns: 1000 }
      );
    });

    it("handles BC era strings", () => {
      fc.assert(
        fc.property(
          fc.date({
            min: new Date("-009990-01-01 00:00:00"),
            max: new Date("-000001-12-31 23:59:59"),
          }),
          fc.constantFrom(...TEST_FORMATS),
          fc.constantFrom("BC", "BCE", "bc", "bce"),
          (d, fmt, era) => {
            /**
             * Similiar to the above. There are dates that only exist in
             * BC or AD but not both, so we have to keep them separate.
             */
            const result = parseTextToDate(`${format(d, fmt)} ${era}`)!;
            expect(result).toBeDefined();
            expect(format(result[0], fmt)).toBe(format(d, fmt));
            expect(format(result[1], fmt)).toBe(format(d, fmt));
          }
        ),
        { numRuns: 1000 }
      );
    });
  });
});
