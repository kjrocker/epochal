import { endOfYear, startOfYear } from "date-fns";
import { attachMetadata, Handler, InputHandler } from "../util/util";
import { matchYearShorthand } from "./year";

const stringToYearList = (input: string): number[] | null => {
  const list = input
    .split(",")
    .map((year) => year.trim())
    .flatMap((year) => {
      // First try shorthand range expansion (e.g., "1920-25" -> ["1920", "1925"])
      const shorthandResult = matchYearShorthand(year);
      if (shorthandResult) {
        return shorthandResult;
      }
      
      // If not shorthand, treat as individual year
      if (/^\d{4}$/.test(year)) {
        return [year];
      }
      
      // Invalid format
      return [null];
    })
    .map((year) => (year ? parseInt(year, 10) : null));
  if (list.some((year) => year === null)) return null;
  return list as number[];
};

const firstAndLast = (list: number[]): [number, number] | null => {
  if (list.length < 2) return null;
  list.sort((a, b) => a - b);
  const first = list[0];
  const last = list[list.length - 1];
  return [first, last];
};

export const handleYearListRange: InputHandler = (input, options) => {
  return input
    .map(stringToYearList)
    .map(firstAndLast)
    .map(([start, end]): [Date, Date] => {
      return [startOfYear(new Date(start, 0, 1)), endOfYear(new Date(end, 11, 31))];
    })
    .map(attachMetadata(Handler.RANGE));
};
