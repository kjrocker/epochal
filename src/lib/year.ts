import { startOfYear } from "date-fns/startOfYear";
import { Maybe } from "./util/maybe";
import { endOfYear } from "date-fns/endOfYear";
import {
  attachMetadata,
  getYearWithCenturyBreakpoint,
  InputHandler,
  Handler,
} from "./util/util";
import { EpochizeOptions } from "./util/options";

const getYear = (
  year: string,
  era: string,
  options: EpochizeOptions
): number => {
  if (era && era.startsWith("b")) return Number.parseInt(year) * -1;
  return getYearWithCenturyBreakpoint(year, era, options);
};

const eraMatch = (text: string, options: EpochizeOptions): number | null => {
  const eraMatches = text.match(/^(?<num>[0-9]+)\s+(?<era>[a-z]*)$/);
  if (!eraMatches?.groups) return null;
  const { num, era } = eraMatches?.groups ?? { num: "", era: "" };
  return getYear(num, era, options);
};

const noEraMatch = (text: string, options: EpochizeOptions): number | null => {
  const noEraMatches = text.match(/^(?<num>[0-9]+)$/);
  if (!noEraMatches?.groups) return null;
  return getYear(noEraMatches.groups.num, "", options);
};

// Convert a millenium string to an integer, positive for AD, negative for BC
const yearToNumber = (
  text: string,
  options: EpochizeOptions
): Maybe<number> => {
  return Maybe.fromValue(text).tryEach(
    (text) => eraMatch(text, options),
    (text) => noEraMatch(text, options)
  );
};

export const handleYear: InputHandler = (input, options) => {
  return input
    .flatMap((string) => yearToNumber(string, options))
    .map((year) => {
      const date = new Date(year, 4, 1);
      date.setFullYear(year < 0 ? year + 1 : year);
      return date;
    })
    .map((date): [Date, Date] => [startOfYear(date), endOfYear(date)])
    .map(attachMetadata(Handler.YEAR));
};
