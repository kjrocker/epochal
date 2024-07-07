import fc from "fast-check";
import { epochize } from ".";
import { format } from "date-fns/format";

describe("format IN matches start/end format OUT", () => {
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
  ];

  const ERA_TEST_FORMATS = TEST_FORMATS.map((s) => `${s} GG`);

  it("handles CE era strings", () => {
    fc.assert(
      fc.property(
        fc.date({
          min: new Date("0001-01-01 00:00:00"),
          max: new Date("9999-12-31 23:59:59"),
        }),
        fc.constantFrom(...TEST_FORMATS, ...ERA_TEST_FORMATS),
        (d, fmt) => {
          /**
           * This test is a bit of a hack. Basically, "1994" should give us
           * a start and end date that, formatted 'yyyy', will also be "1994".
           *
           * This ensures that July 1st formatted a certain way doesn't drift
           * into June 30th or something.
           */
          const formattedDate = format(d, fmt);
          const result = epochize(formattedDate)!;
          expect(result).toBeDefined();
          expect(format(result[0], fmt)).toBe(formattedDate);
          expect(format(result[1], fmt)).toBe(formattedDate);
        }
      ),
      { numRuns: 10000 }
    );
  });

  it("handles BC era strings", () => {
    fc.assert(
      fc.property(
        fc.date({
          min: new Date("0000-12-31 23:59:59"),
          max: new Date("-9999-12-31 23:59:59"),
        }),
        fc.constantFrom(...ERA_TEST_FORMATS),
        (d, fmt) => {
          /**
           * The same as before, but with BC era dates and only formats that include era
           */
          const formattedDate = format(d, fmt);
          const result = epochize(formattedDate)!;
          expect(result).toBeDefined();
          expect(format(result[0], fmt)).toBe(formattedDate);
          expect(format(result[1], fmt)).toBe(formattedDate);
        }
      ),
      { numRuns: 10000 }
    );
  });
});
