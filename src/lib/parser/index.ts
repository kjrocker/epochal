import isValid from "date-fns/isValid";
import parseFn from "date-fns/parse";
import { getEndDate, getStartDate } from "../date-fns";
import { stringToParseStruct } from "./stringToParseStruct";
import { ParseResult as RawParseResult } from "./util";

const leadZeros = (num: number, len: number): string =>
  num.toString().padStart(len, "0");

export type ParseResult = {
  start: Date;
  end: Date;
};

const parseResultToString = (input: Required<RawParseResult>): string => {
  const { year, month, day, era } = input;
  const yearString = leadZeros(year, 4);
  const monthString = month ? leadZeros(month, 2) : "01";
  const dayString = day ? leadZeros(day, 2) : "01";
  const eraString = era === "BCE" ? "BC" : "AD";
  return `${yearString}-${monthString}-${dayString} 00:00:00 ${eraString}`;
};

const parseResultToDate = (input: Required<RawParseResult>): Date => {
  const formattedDateString = parseResultToString(input);
  return parseFn(formattedDateString, "yyyy-MM-dd HH:mm:ss GG", new Date());
};

export const parseTextToDate = (text: string): [Date, Date] | undefined => {
  const date = stringToParseStruct(text) as
    | Required<RawParseResult>
    | undefined;
  if (!date) return undefined;
  const baseDate = parseResultToDate(date);
  const start = getStartDate(baseDate, date.precision);
  const end = getEndDate(baseDate, date.precision);
  if (isValid(start) && isValid(end)) {
    return [start, end];
  } else {
    return undefined;
  }
};
