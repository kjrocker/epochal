import { TimePrecision } from "../types";

export type ParseResult = {
  era?: "CE" | "BCE";
  year: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  precision?: TimePrecision;
};

export const clean = (str: string): string => {
  if (!str) return "";
  return str.trim().toLowerCase();
};

export const parseEra = (era?: string): "BCE" | "CE" => {
  switch (era) {
    case "bc":
      return "BCE";
    case "bce":
      return "BCE";
    case "ad":
      return "CE";
    default:
      return "CE";
  }
};

export const lookupMonth = (month: string): number => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Just trust the lookup
  return MONTH_LOOKUP[month];
};

export const applyPrecision = (time: ParseResult): ParseResult => {
  if (time.precision) {
    return time;
  } else if (time.month === undefined) {
    return { ...time, precision: TimePrecision.YEAR };
  } else if (time.day === undefined) {
    return { ...time, precision: TimePrecision.MONTH };
  } else {
    return { ...time, precision: TimePrecision.DAY };
  }
};

const MONTH_LOOKUP = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};
