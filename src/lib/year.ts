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
import { add, sub } from "date-fns";

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

const yearToDate = (year: number): Date | null => {
  const date = new Date(year, 4, 1);
  date.setFullYear(year < 0 ? year + 1 : year);
  return date;
};

interface YearParseResult {
  year: Date;
  modifier?: "circa";
  original: string;
}

const parseYearWithModifier = (
  text: string,
  options: EpochizeOptions
): YearParseResult | null => {
  const hasCirca = /ca\.|c\.|circa/.test(text);
  const yearWithoutCirca = hasCirca ? text.replace(/ca\.|c\.|circa/, "").trim() : text;
  const year = yearToNumber(yearWithoutCirca, options).map(yearToDate).get();
  if (!year) return null;
  return { year, modifier: hasCirca ? "circa" : undefined, original: text };
};

const applyModifierToDateRange = (
  year: Date,
  modifier: "circa" | "after" | undefined,
  options: EpochizeOptions
): [Date, Date] => {
  if (modifier === "circa") {
    return [
      startOfYear(sub(year, { years: options.circaStartOffset })),
      endOfYear(add(year, { years: options.circaEndOffset })),
    ];
  } else {
    return [startOfYear(year), endOfYear(year)];
  }
};

export const handleYear: InputHandler = (input, options) => {
  return input
    .map((string) => parseYearWithModifier(string, options))
    .map(({ year, modifier }): [Date, Date] => {
      return applyModifierToDateRange(year, modifier, options);
    })
    .map(attachMetadata(Handler.YEAR));
};
