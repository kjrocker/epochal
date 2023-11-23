import { Maybe } from "./maybe";
import { lookupMonth } from "./util";
import startOfDay from "date-fns/startOfDay";
import endOfDay from "date-fns/endOfDay";

type GetMonthYearDay = (
  input: string
) => { year: number; month: number; day: number } | null;

const mapMatchGroups = (input: { [key: string]: string }) => {
  const { year, month, day, era } = input;
  const monthInt = Number.parseInt(month);
  return {
    year:
      era && era.startsWith("b")
        ? (Number.parseInt(year) - 1) * -1
        : Number.parseInt(year),
    month: Number.isInteger(monthInt) ? monthInt : lookupMonth(month),
    day: Number.parseInt(day),
  };
};

const monthSlashDaySlashYearEra: GetMonthYearDay = (input) => {
  const matches = input.match(
    /^(?<month>[0-9]+)\/(?<day>[0-9]+)\/(?<year>[0-9]+)\s*(?<era>\w*)$/
  );
  if (!matches?.groups) return null;
  return mapMatchGroups(matches.groups);
};

const fullMonthNameDayYearEra: GetMonthYearDay = (input) => {
  const matches = input.match(
    RegExp(
      `^${MONTH_NAME.source}\\s*${DAY_WITH_ORDINAL.source}\\s*(?<year>[0-9]+)\\s*(?<era>\\w*)$`
    )
  );
  if (!matches?.groups) return null;
  return mapMatchGroups(matches.groups);
};

const MONTH_NAME =
  /(?<month>january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/;
const DAY_WITH_ORDINAL = /(?<day>[0-9]+)\w{0,2}/;

const textToYearMonthDay = (
  input: string
): Maybe<{ year: number; month: number; day: number }> => {
  return Maybe.fromValue(input).tryEach(
    monthSlashDaySlashYearEra,
    fullMonthNameDayYearEra
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
