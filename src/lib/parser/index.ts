import { TimePrecision } from "../types";
import {
  applyPrecision,
  clean,
  lookupMonth,
  parseEra,
  ParseResult,
} from "./util";

const justYear = (year: string) => ({ year: Number.parseInt(year) });
const yearEra = (year: string, era: string) => ({
  year: Number.parseInt(year),
  era: parseEra(era),
});
const yearMonth = (year: string, month: string) => ({
  year: Number.parseInt(year),
  month: Number.parseInt(month),
});
const yearMonthEra = (year: string, month: string, era: string) => ({
  year: Number.parseInt(year),
  month: Number.parseInt(month),
  era: parseEra(era),
});
const yearMonthDay = (year: string, month: string, day: string) => ({
  year: Number.parseInt(year),
  month: Number.parseInt(month),
  day: Number.parseInt(day),
});
const yearMonthDayEra = (
  year: string,
  month: string,
  day: string,
  era: string
) => ({
  year: Number.parseInt(year),
  month: Number.parseInt(month),
  day: Number.parseInt(day),
  era: parseEra(era),
});
const stringMonthYear = (month: string, year: string, era?: string) => {
  return {
    month: lookupMonth(month),
    year: Number.parseInt(year),
    era: parseEra(era),
  };
};
const shortStringMonthYear = (month: string, year: string, era?: string) => {
  return {
    month: lookupMonth(month),
    year: Number.parseInt(year),
    era: parseEra(era),
  };
};
const stringMonthDayYear = (
  month: string,
  day: string,
  year: string,
  era?: string
) => {
  return {
    month: lookupMonth(month),
    day: Number.parseInt(day),
    year: Number.parseInt(year),
    era: parseEra(era),
  };
};
const shortStringMonthDayYear = (
  month: string,
  day: string,
  year: string,
  era?: string
) => {
  return {
    month: lookupMonth(month),
    day: Number.parseInt(day),
    year: Number.parseInt(year),
    era: parseEra(era),
  };
};
const century = (century: string, range: string, era: string) => {
  const getYearFromCentury = (cen: number): number => {
    return cen * 100 - 50;
  };
  return {
    year: getYearFromCentury(Number.parseInt(century)),
    era: parseEra(era),
    precision: TimePrecision.CENTURY,
  };
};
const millenium = (millenium: string, range: string, era: string) => {
  const getYearFromMillenium = (cen: number): number => {
    return cen * 1000 - 500;
  };
  return {
    year: getYearFromMillenium(Number.parseInt(millenium)),
    era: parseEra(era),
    precision: TimePrecision.MILLENIUM,
  };
};
const decade = (year: string, era: string) => {
  return {
    year:
      Number.parseInt(year) >= 0
        ? Number.parseInt(year) + 3
        : Number.parseInt(year) - 3,
    era: parseEra(era),
    precision: TimePrecision.DECADE,
  };
};
const stringDayMonthYear = (
  day: string,
  month: string,
  year: string,
  era: string
) => {
  return {
    era: parseEra(era),
    day: Number.parseInt(day),
    month: lookupMonth(month),
    year: Number.parseInt(year),
  };
};
const shortStringDayMonthYear = (
  day: string,
  month: string,
  year: string,
  era: string
) => {
  return {
    era: parseEra(era),
    day: Number.parseInt(day),
    month: lookupMonth(month),
    year: Number.parseInt(year),
  };
};

// October;

const regexTable = [
  // Centuries, Millenia, and Decades
  [/^([0-9]+)[A-Za-z]*\s+(century|Cen|cen)$/, century],
  [/^([0-9]+)[A-Za-z]*\s+(century|Cen|cen)\s*(\w+)$/, century],
  [/^([0-9]+)[A-Za-z]*\s+(millenium|mil|m)$/, millenium],
  [/^([0-9]+)[A-Za-z]*\s+(millenium|mil|m)\s*(\w+)$/, millenium],
  [/^([0-9]+)s$/, decade],
  [/^([0-9]+)s\s*(\w+)$/, decade],
  // Numerical Formats
  [/^([0-9]+)$/, justYear],
  [/^([0-9]+)\s*(\w+)$/, yearEra],
  [/^([0-9]+)\/([0-9]+)$/, yearMonth],
  [/^([0-9]+)\/([0-9]+)\s*(\w+)$/, yearMonthEra],
  [/^([0-9]+)\/([0-9]+)\/([0-9]+)$/, yearMonthDay],
  [/^([0-9]+)\/([0-9]+)\/([0-9]+)\s*(\w+)$/, yearMonthDayEra],
  // Block of "Plain English" Months w/o Era
  [
    /^(january|february|march|april|may|june|july|august|september|october|november|december)\s*([0-9]+)$/,
    stringMonthYear,
  ],
  [
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[.\s]*([0-9]+)$/,
    shortStringMonthYear,
  ],
  [
    /^(january|february|march|april|may|june|july|august|september|october|november|december)\s*([0-9]+)[A-Za-z]*[,\s]*([0-9]+)$/,
    stringMonthDayYear,
  ],
  [
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[.\s]*([0-9]+)[A-Za-z]*[,\s]*([0-9]+)$/,
    shortStringMonthDayYear,
  ],
  [
    /^([0-9]+)\s*(january|february|march|april|may|june|july|august|september|october|november|december)\s*([0-9]+)$/,
    stringDayMonthYear,
  ],
  [
    /^([0-9]+)\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[.\s]*([0-9]+)$/,
    shortStringDayMonthYear,
  ],
  // Block of "Plain English" dates WITH capture blocks for Era
  [
    /^(january|february|march|april|may|june|july|august|september|october|november|december)\s*([0-9]+)\s*([A-Za-z]*)$/,
    stringMonthYear,
  ],
  [
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[.\s]*([0-9]+)\s*([A-za-z]*)$/,
    shortStringMonthYear,
  ],
  [
    /^(january|february|march|april|may|june|july|august|september|october|november|december)\s*([0-9]+)[A-Za-z]*[,\s]*([0-9]+)\s*([A-Za-z]*)$/,
    stringMonthDayYear,
  ],
  [
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[.\s]*([0-9]+)[A-Za-z]*[,\s]*([0-9]+)\s*([A-Za-z]*)$/,
    shortStringMonthDayYear,
  ],
  [
    /^([0-9]+)\s*(january|february|march|april|may|june|july|august|september|october|november|december)\s*([0-9]+)\s*([A-Za-z]*)$/,
    stringDayMonthYear,
  ],
  [
    /^([0-9]+)\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[.\s]*([0-9]+)\s*([A-Za-z]*)$/,
    shortStringDayMonthYear,
  ],
] as const;

export const parseSingleDate = (str?: string): ParseResult | undefined => {
  if (str === undefined) return undefined;
  const cleanStr = clean(str);
  let result: ParseResult | undefined = undefined;
  for (const row of regexTable) {
    const [rx, fn] = row;
    const [_head, ...rest] = cleanStr.match(rx) ?? [];
    if (rest.length >= 1) {
      // @ts-expect-error `rest` is an array of strings, `fn` takes a variable number of strings
      result = applyPrecision(fn(...rest));
      break;
    }
  }
  return result;
};
