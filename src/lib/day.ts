import { Maybe } from "./util/maybe";
import {
  attachMetadata,
  InputHandler,
  lookupMonth,
  Handler,
} from "./util/util";
import { startOfDay } from "date-fns/startOfDay";
import { endOfDay } from "date-fns/endOfDay";
import { EN_MONTHS } from "./util/regex";

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

const dayMonthNameYearEra: GetMonthYearDay = (input) => {
  const matches = input.match(
    RegExp(
      `^(?<day>[0-9]+)\\s+${EN_MONTHS.source}\\s+(?<year>[0-9]+)\\s*(?<era>[a-z]*)$`
    )
  );
  if (!matches?.groups) return null;
  return mapMatchGroups(matches.groups);
};

const yearSlashMonthSlashDayEra: GetMonthYearDay = (input) => {
  const matches = input.match(
    /^(?<year>[0-9]+)\/(?<month>[0-9]+)\/(?<day>[0-9]+)\s*(?<era>\w*)$/
  );
  if (!matches?.groups) return null;
  return mapMatchGroups(matches.groups);
};

const fullMonthNameDayYearEra: GetMonthYearDay = (input) => {
  const matches = input.match(
    RegExp(
      `^${EN_MONTHS.source}\\s*(?<day>[0-9]+)\\w{0,2},?\\s*(?<year>[0-9]+)\\s*(?<era>[a-z]*)$`
    )
  );
  if (!matches?.groups) return null;
  return mapMatchGroups(matches.groups);
};

const textToYearMonthDay = (
  input: string
): Maybe<{ year: number; month: number; day: number }> => {
  return Maybe.fromValue(input).tryEach(
    dayMonthNameYearEra,
    yearSlashMonthSlashDayEra,
    fullMonthNameDayYearEra
  );
};

export const handleDay: InputHandler = (input) => {
  return input
    .flatMap((string) => textToYearMonthDay(string))
    .map(({ year, month, day }) => {
      const date = new Date(year, month - 1, day);
      date.setFullYear(year);
      return date;
    })
    .map((date): [Date, Date] => [startOfDay(date), endOfDay(date)])
    .map(attachMetadata(Handler.DAY));
};
