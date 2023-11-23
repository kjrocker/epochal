import startOfMonth from "date-fns/startOfMonth";
import { Maybe } from "./util/maybe";
import { endOfMonth } from "date-fns";
import { lookupMonth } from "./util/util";
import { EN_MONTHS } from "./util/regex";

type GetMonthYear = (input: string) => { year: number; month: number } | null;

const mapMatchGroups = (input: { [key: string]: string }) => {
  const { year, month, era } = input;
  const monthInt = Number.parseInt(month);
  return {
    year:
      era && era.startsWith("b")
        ? (Number.parseInt(year) - 1) * -1
        : Number.parseInt(year),
    month: Number.isInteger(monthInt) ? monthInt : lookupMonth(month),
  };
};

const monthSlashYearEra: GetMonthYear = (input) => {
  const matches = input.match(
    /^(?<year>[0-9]+)\/(?<month>[0-9]+)\s*(?<era>\w*)$/
  );
  if (!matches?.groups) return null;
  return mapMatchGroups(matches.groups);
};

const shortMonthNameYearEra: GetMonthYear = (input) => {
  const matches = input.match(
    RegExp(`^${EN_MONTHS.source}\\s*(?<year>[0-9]+)\\s*(?<era>\\w*)$`)
  );
  if (!matches?.groups) return null;
  return mapMatchGroups(matches.groups);
};

const textToYearAndMonth = (
  input: string
): Maybe<{ year: number; month: number }> => {
  return Maybe.fromValue(input).tryEach(
    monthSlashYearEra,
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
