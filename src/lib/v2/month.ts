import startOfMonth from "date-fns/startOfMonth";
import { Maybe } from "./maybe";
import { endOfMonth } from "date-fns";
import { lookupMonth } from "./util";

type GetMonthYear = (input: string) => { year: number; month: number } | null;

const monthSlashYear: GetMonthYear = (input) => {
  const matches = input.match(/^(?<month>[0-9]+)\/(?<year>[0-9]+)$/);
  if (!matches?.groups) return null;
  const { year, month } = matches.groups;
  return { year: Number.parseInt(year), month: Number.parseInt(month) };
};

const monthSlashYearEra: GetMonthYear = (input) => {
  const matches = input.match(
    /^(?<month>[0-9]+)\/(?<year>[0-9]+)\s*(?<era>\w+)$/
  );
  if (!matches?.groups) return null;
  const { year, month, era } = matches.groups;
  return {
    year: era.startsWith("b")
      ? (Number.parseInt(year) - 1) * -1
      : Number.parseInt(year),
    month: Number.parseInt(month),
  };
};

const fullMonthNameYearEra: GetMonthYear = (input) => {
  const matches = input.match(
    /^(?<month>january|february|march|april|may|june|july|august|september|october|november|december)\s*(?<year>[0-9]+)\s*(?<era>\w+)$/
  );
  if (!matches?.groups) return null;
  const { year, month, era } = matches.groups;
  return {
    year: era.startsWith("b")
      ? (Number.parseInt(year) - 1) * -1
      : Number.parseInt(year),
    month: lookupMonth(month),
  };
};

const fullMonthNameYear: GetMonthYear = (input) => {
  const matches = input.match(
    /^(?<month>january|february|march|april|may|june|july|august|september|october|november|december)\s*(?<year>[0-9]+)$/
  );
  if (!matches?.groups) return null;
  const { year, month } = matches.groups;
  return { year: Number.parseInt(year), month: lookupMonth(month) };
};

const shortMonthNameYearEra: GetMonthYear = (input) => {
  const matches = input.match(
    /^(?<month>jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(?<year>[0-9]+)\s*(?<era>\w+)$/
  );
  if (!matches?.groups) return null;
  const { year, month, era } = matches.groups;
  return {
    year: era.startsWith("b")
      ? (Number.parseInt(year) - 1) * -1
      : Number.parseInt(year),
    month: lookupMonth(month),
  };
};

const shortMonthNameYear: GetMonthYear = (input) => {
  const matches = input.match(
    /^(?<month>jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(?<year>[0-9]+)$/
  );
  if (!matches?.groups) return null;
  const { year, month } = matches.groups;
  return { year: Number.parseInt(year), month: lookupMonth(month) };
};

const textToYearAndMonth = (
  input: string
): Maybe<{ year: number; month: number }> => {
  return Maybe.fromValue(input).tryEach(
    monthSlashYear,
    monthSlashYearEra,
    fullMonthNameYear,
    fullMonthNameYearEra,
    shortMonthNameYear,
    shortMonthNameYearEra
  );
};

export const handleMonth = (input: Maybe<string>): Maybe<[Date, Date]> => {
  return input
    .flatMap((string) => textToYearAndMonth(string))
    .map(({ year, month }) => {
      const date = new Date(year, month - 1);
      date.setFullYear(year);
      return date;
    })
    .map((date) => [startOfMonth(date), endOfMonth(date)]);
};
