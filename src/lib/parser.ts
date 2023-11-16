import { parseSingleDate } from "./parser/index";
import {
  endOfDay,
  endOfMonth,
  endOfYear,
  isValid,
  parse as parseFn,
  startOfDay,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { ParseResult as RawParseResult } from "./parser/util";
import {
  endOfDecade,
  endOfCentury,
  endOfMillenium,
  startOfDecade,
  startOfCentury,
  startOfMillenium,
} from "./date-fns";
import { TimePrecision } from "./types";

const leadZeros = (num: number, len: number): string =>
  num.toString().padStart(len, "0");

const getStartDate = (date: Date, precision: TimePrecision): Date => {
  switch (precision) {
    case TimePrecision.DAY:
      return startOfDay(date);
    case TimePrecision.MONTH:
      return startOfMonth(date);
    case TimePrecision.YEAR:
      return startOfYear(date);
    case TimePrecision.DECADE:
      return startOfDecade(date);
    case TimePrecision.CENTURY:
      return startOfCentury(date);
    case TimePrecision.MILLENIUM:
      return startOfMillenium(date);
    default:
      return date;
  }
};

const getEndDate = (date: Date, precision: TimePrecision): Date => {
  switch (precision) {
    case TimePrecision.DAY:
      return endOfDay(date);
    case TimePrecision.MONTH:
      return endOfMonth(date);
    case TimePrecision.YEAR:
      return endOfYear(date);
    case TimePrecision.DECADE:
      return endOfDecade(date);
    case TimePrecision.CENTURY:
      return endOfCentury(date);
    case TimePrecision.MILLENIUM:
      return endOfMillenium(date);
    default:
      return date;
  }
};

export type ParseResult = {
  start: Date;
  end: Date;
};

export const parseTextToDate = (text: string): [Date, Date] | undefined => {
  const date = parseSingleDate(text) as Required<RawParseResult> | undefined;
  if (!date) return undefined;
  const { year, month = 1, day = 1, era = "CE", precision } = date;
  const formattedDateString = `${leadZeros(
    era === "BCE" ? year : year,
    4
  )}-${leadZeros(month, 2)}-${leadZeros(day, 2)} 00:00:00 ${
    era === "BCE" ? "BC" : "AD"
  }`;
  const baseDate = parseFn(
    formattedDateString,
    "yyyy-MM-dd HH:mm:ss GG",
    new Date()
  );
  const [start, end] = [
    getStartDate(baseDate, precision),
    getEndDate(baseDate, precision),
  ];
  if (isValid(start) && isValid(end)) {
    return [start, end];
  } else {
    return undefined;
  }
};
