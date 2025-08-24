import { endOfYear, startOfYear } from "date-fns";
import { attachMetadata, Handler, InputHandler } from "./util/util";

// Parsing the shorthand "2020-5" to "[2020, 2025]". Works for one or two digit shortcuts.
const parseShorthand = (input: string): [number, number] | null => {
  const matches = input.match(/^(?<start>[0-9]{1,4})(?:-(?<end>[0-9]{1,4}))?$/);
  if (!matches?.groups) return null;

  const start = Number(matches.groups.start);
  const end = Number(matches.groups.end);

  if (isNaN(start) || isNaN(end)) return null;

  if (end % 100 === end && end % 100 > start % 100) {
    return [start, Math.floor(start / 100) * 100 + end];
  } else if (end % 10 === end && end % 10 > start % 10) {
    return [start, Math.floor(start / 10) * 10 + end];
  }
  return null;
};

// Convert a tuple of years into a tuple of dates, return null if anything goes wrong
const parseNumbersToDates = (input: [number, number]): [Date, Date] | null => {
  const [startYear, endYear] = input;

  try {
    const startDate = new Date(startYear, 0, 1); // January 1st of start year
    const endDate = new Date(endYear, 0, 1); // January 1st of end year

    const start = startOfYear(startDate);
    const end = endOfYear(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }

    return [start, end];
  } catch {
    return null;
  }
};

export const handleYearRangeShorthand: InputHandler = (input, options) => {
  return input
    .map(parseShorthand)
    .map(parseNumbersToDates)
    .map(([start, end]): [Date, Date] => [startOfYear(start), endOfYear(end)])
    .map(attachMetadata(Handler.YEAR));
};
