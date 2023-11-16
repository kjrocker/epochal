import { format } from 'date-fns';
import fc from 'fast-check';
import { parseTextToDate } from './parser';

const Decade_Century_Millenium_TestCases = [
  // Decades
  ['20s BC', '0029-01-01 00:00:00 BC', '0020-12-31 23:59:59 BC'],
  ['10s BC', '0019-01-01 00:00:00 BC', '0010-12-31 23:59:59 BC'],
  ['0s BC', '0009-01-01 00:00:00 BC', '0001-12-31 23:59:59 BC'],
  ['0s', '0001-01-01 00:00:00 AD', '0009-12-31 23:59:59 AD'],
  ['10s', '0010-01-01 00:00:00 AD', '0019-12-31 23:59:59 AD'],
  ['20s', '0020-01-01 00:00:00 AD', '0029-12-31 23:59:59 AD'],
  // Centuries
  ['2nd century BC', '0200-01-01 00:00:00 BC', '0101-12-31 23:59:59 BC'],
  ['1st century BC', '0100-01-01 00:00:00 BC', '0001-12-31 23:59:59 BC'],
  ['1st century', '0001-01-01 00:00:00 AD', '0100-12-31 23:59:59 AD'],
  ['2nd century', '0101-01-01 00:00:00 AD', '0200-12-31 23:59:59 AD'],
  // Other Formats
  ['2 cen BC', '0200-01-01 00:00:00 BC', '0101-12-31 23:59:59 BC'],
  ['1 century BC', '0100-01-01 00:00:00 BC', '0001-12-31 23:59:59 BC'],
  ['1 century', '0001-01-01 00:00:00 AD', '0100-12-31 23:59:59 AD'],
  ['2 cen', '0101-01-01 00:00:00 AD', '0200-12-31 23:59:59 AD'],
  // Millenia
  ['2nd millenium BC', '2000-01-01 00:00:00 BC', '1001-12-31 23:59:59 BC'],
  ['1st millenium BC', '1000-01-01 00:00:00 BC', '0001-12-31 23:59:59 BC'],
  ['1st millenium', '0001-01-01 00:00:00 AD', '1000-12-31 23:59:59 AD'],
  ['2nd millenium', '1001-01-01 00:00:00 AD', '2000-12-31 23:59:59 AD'],
  // Other Formats
  ['2 mil BC', '2000-01-01 00:00:00 BC', '1001-12-31 23:59:59 BC'],
  ['1 millenium BC', '1000-01-01 00:00:00 BC', '0001-12-31 23:59:59 BC'],
  ['1 m', '0001-01-01 00:00:00 AD', '1000-12-31 23:59:59 AD'],
  ['2 mil', '1001-01-01 00:00:00 AD', '2000-12-31 23:59:59 AD'],
];

describe(parseTextToDate.name, () => {
  test.each(Decade_Century_Millenium_TestCases)(
    `handles: %s`,
    (input, expectedStart, expectedEnd) => {
      const { start, end } = parseTextToDate(input)!;
      expect(format(start, 'yyyy-MM-dd HH:mm:ss GG')).toBe(expectedStart);
      expect(format(end, 'yyyy-MM-dd HH:mm:ss GG')).toBe(expectedEnd);
    }
  );

  describe('formats', () => {
    const TEST_FORMATS = [
      'yyyy',
      'yyyy/MM',
      'yyyy/MM/dd',
      'MMM yyyy',
      'MMMM yyyy',
      'MMM do yyyy',
      'MMM dd yyyy',
      'MMMM do yyyy',
      'MMMM dd yyyy',
      'dd MMM yyyy',
      'dd MMMM yyyy',
    ] as const;

    it('handles CE era strings', () => {
      fc.assert(
        fc.property(
          fc.date({
            min: new Date('0001-01-01 00:00:00'),
            max: new Date('6000-12-31 23:59:59'),
          }),
          fc.constantFrom(...TEST_FORMATS),
          fc.constantFrom('', 'AD', 'CE', 'ad', 'ce'),
          (d, fmt, era) => {
            const result = parseTextToDate(`${format(d, fmt)} ${era}`)!;
            expect(result).toBeDefined();
            expect(format(result.start, fmt)).toBe(format(d, fmt));
            expect(format(result.end, fmt)).toBe(format(d, fmt));
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('handles BC era strings', () => {
      fc.assert(
        fc.property(
          fc.date({
            min: new Date('-006000-01-01 00:00:00'),
            max: new Date('-000001-12-31 23:59:59'),
          }),
          fc.constantFrom(...TEST_FORMATS),
          fc.constantFrom('BC', 'BCE', 'bc', 'bce'),
          (d, fmt, era) => {
            const result = parseTextToDate(`${format(d, fmt)} ${era}`)!;
            expect(result).toBeDefined();
            expect(format(result.start, fmt)).toBe(format(d, fmt));
            expect(format(result.end, fmt)).toBe(format(d, fmt));
          }
        ),
        { numRuns: 1000 }
      );
    });
  });
});
