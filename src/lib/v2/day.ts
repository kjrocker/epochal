import { Maybe } from "./maybe";
import { lookupMonth } from "./util";
import startOfDay from "date-fns/startOfDay";
import endOfDay from "date-fns/endOfDay";

type GetMonthYearDay = (
  input: string
) => { year: number; month: number; day: number } | null;

const monthSlashDaySlashYear: GetMonthYearDay = (input) => {
  const matches = input.match(
    /^(?<month>[0-9]+)\/(?<day>[0-9]+)\/(?<year>[0-9]+)$/
  );
  if (!matches?.groups) return null;
  const { year, month, day } = matches.groups;
  return {
    year: Number.parseInt(year),
    month: Number.parseInt(month),
    day: Number.parseInt(day),
  };
};

const monthSlashDaySlashYearEra: GetMonthYearDay = (input) => {
  const matches = input.match(
    /^(?<month>[0-9]+)\/(?<day>[0-9]+)\/(?<year>[0-9]+)\s*(?<era>\w+)$/
  );
  if (!matches?.groups) return null;
  const { year, month, day, era } = matches.groups;
  return {
    year: era.startsWith("b")
      ? (Number.parseInt(year) - 1) * -1
      : Number.parseInt(year),
    month: Number.parseInt(month),
    day: Number.parseInt(day),
  };
};

const fullMonthNameDayYearEra: GetMonthYearDay = (input) => {
  const matches = input.match(
    /^(?<month>january|february|march|april|may|june|july|august|september|october|november|december)\s*(?<day>[0-9]+)\s*(?<year>[0-9]+)\s*(?<era>\w+)$/
  );
  if (!matches?.groups) return null;
  const { year, month, day, era } = matches.groups;
  return {
    year: era.startsWith("b")
      ? (Number.parseInt(year) - 1) * -1
      : Number.parseInt(year),
    month: lookupMonth(month),
    day: Number.parseInt(day),
  };
};

const fullMonthNameDayYear: GetMonthYearDay = (input) => {
  const matches = input.match(
    /^(?<month>january|february|march|april|may|june|july|august|september|october|november|december)\s*(?<day>[0-9]+)\s*(?<year>[0-9]+)$/
  );
  if (!matches?.groups) return null;
  const { year, month, day } = matches.groups;
  return {
    year: Number.parseInt(year),
    month: lookupMonth(month),
    day: Number.parseInt(day),
  };
};

const shortMonthNameDayYearEra: GetMonthYearDay = (input) => {
  const matches = input.match(
    /^(?<month>jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(?<day>[0-9]+)\s*(?<year>[0-9]+)\s*(?<era>\w+)$/
  );
  if (!matches?.groups) return null;
  const { year, month, era, day } = matches.groups;
  return {
    year: era.startsWith("b")
      ? (Number.parseInt(year) - 1) * -1
      : Number.parseInt(year),
    month: lookupMonth(month),
    day: Number.parseInt(day),
  };
};

const shortMonthNameDayYear: GetMonthYearDay = (input) => {
  const matches = input.match(
    /^(?<month>jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(?<day>[0-9]+)\s*(?<year>[0-9]+)$/
  );
  if (!matches?.groups) return null;
  const { year, month, day } = matches.groups;
  return {
    year: Number.parseInt(year),
    month: lookupMonth(month),
    day: Number.parseInt(day),
  };
};

const textToYearMonthDay = (
  input: string
): Maybe<{ year: number; month: number; day: number }> => {
  return Maybe.fromValue(input).tryEach(
    monthSlashDaySlashYear,
    monthSlashDaySlashYearEra,
    fullMonthNameDayYear,
    fullMonthNameDayYearEra,
    shortMonthNameDayYear,
    shortMonthNameDayYearEra
  );
};

export const handleDay = (input: Maybe<string>): Maybe<[Date, Date]> => {
  return input
    .flatMap((string) => textToYearMonthDay(string))
    .map(({ year, month, day }) => {
      const date = new Date(year, month - 1, day);
      date.setFullYear(year);
      return date;
    })
    .map((date) => [startOfDay(date), endOfDay(date)]);
};
