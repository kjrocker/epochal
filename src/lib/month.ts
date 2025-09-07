import { endOfMonth } from "date-fns";
import { startOfMonth } from "date-fns/startOfMonth";
import {
  identityModifier,
  parentheticalModifier,
  zodiacModifier,
} from "./modifiers/identity";
import { earlyMidLateModifier } from "./modifiers/partials";
import { Maybe } from "./util/maybe";
import { Modifier, ModifierConfig } from "./util/modifier";
import { EpochizeOptions } from "./util/options";
import { EN_MONTHS } from "./util/regex";
import {
  attachMetadata,
  getYearWithCenturyBreakpoint,
  Handler,
  InputHandler,
  lookupMonth,
} from "./util/util";

type GetMonthYear = (
  input: string,
  options: EpochizeOptions
) => { year: number; month: number } | null;

const getYear = (
  year: string,
  era: string,
  options: EpochizeOptions
): number => {
  if (era && era.toLowerCase().startsWith("b"))
    return (Number.parseInt(year) - 1) * -1;
  return getYearWithCenturyBreakpoint(year, era, options);
};

const mapMatchGroups = (
  input: { [key: string]: string },
  options: EpochizeOptions
) => {
  const { year, month, era } = input;
  const monthInt = Number.parseInt(month);
  const fullYear = getYear(year, era, options);
  return {
    year: fullYear,
    month: Number.isInteger(monthInt) ? monthInt : lookupMonth(month),
  };
};

const shortMonthNameYearEra: GetMonthYear = (input, options) => {
  const matches = input.match(
    RegExp(`^${EN_MONTHS.source}(?:,)?\\s*(?<year>[0-9]+)\\s*(?<era>[a-z]*)$`)
  );
  if (!matches?.groups) return null;
  return mapMatchGroups(matches.groups, options);
};

const ORDINAL_WORDS: { [key: string]: string } = {
  first: "1",
  second: "2",
  third: "3",
  fourth: "4",
  fifth: "5",
  sixth: "6",
  seventh: "7",
  eighth: "8",
  ninth: "9",
  tenth: "10",
  eleventh: "11",
  twelfth: "12",
};

export const ordinalMonthAndYear: GetMonthYear = (input, options) => {
  // Turn "1st month, 1919" or "first month, 1919" into { month: 1, year: 1919 }
  // Also handle "1774, 2nd month" and "1774, second month" formats

  // Try numeric ordinals first: "1st month, 1919"
  let matches = input.match(
    /^(?<month>\d+)(?:st|nd|rd|th)\s+month\s*,?\s*(?<year>[0-9]+)\s*(?<era>[a-z]*)$/i
  );

  // Try year-first numeric format: "1774, 2nd month"
  if (!matches?.groups) {
    matches = input.match(
      /^(?<year>[0-9]+)\s*(?<era>[a-z]*)\s*,\s*(?<month>\d+)(?:st|nd|rd|th)\s+month$/i
    );
  }

  // Try word ordinals: "first month, 1919"
  if (!matches?.groups) {
    const wordMatch = input.match(
      /^(?<month>first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)\s+month\s*,?\s*(?<year>[0-9]+)\s*(?<era>[a-z]*)$/i
    );
    if (wordMatch?.groups) {
      matches = {
        ...wordMatch,
        groups: {
          ...wordMatch.groups,
          month: ORDINAL_WORDS[wordMatch.groups.month.toLowerCase()],
        },
      } as RegExpMatchArray;
    }
  }

  // Try year-first word format: "1774, first month"
  if (!matches?.groups) {
    const wordMatch = input.match(
      /^(?<year>[0-9]+)\s*(?<era>[a-z]*)\s*,\s*(?<month>first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)\s+month$/i
    );
    if (wordMatch?.groups) {
      matches = {
        ...wordMatch,
        groups: {
          ...wordMatch.groups,
          month: ORDINAL_WORDS[wordMatch.groups.month.toLowerCase()],
        },
      } as RegExpMatchArray;
    }
  }

  if (!matches?.groups) return null;

  const monthInt = Number.parseInt(matches.groups.month);

  // Validate month is between 1-12
  if (monthInt < 1 || monthInt > 12) return null;

  return mapMatchGroups(matches.groups, options);
};

const textToYearAndMonth = (
  input: string,
  options: EpochizeOptions
): Maybe<{ year: number; month: number }> => {
  return Maybe.fromValue(input).tryEach(
    (text) => shortMonthNameYearEra(text, options),
    (text) => ordinalMonthAndYear(text, options)
  );
};

const circaModifier = (
  options: EpochizeOptions
): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /ca\.|c\.|circa/.test(text),
  extractor: (text) => text.replace(/ca\.|c\.|circa/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => dates,
});

export const handleMonth: InputHandler = (input, options) => {
  return input
    .flatMap((text) =>
      Modifier.fromValue(text)
        .withModifier(identityModifier())
        .withModifier(parentheticalModifier())
        .withModifier(circaModifier(options))
        .withModifier(zodiacModifier())
        .withModifier(earlyMidLateModifier())
        .flatMap((text) => textToYearAndMonth(text, options))
        .map(({ year, month }) => {
          const date = new Date(year, month - 1);
          date.setFullYear(year);
          return date;
        })
        .map((date): [Date, Date] => [startOfMonth(date), endOfMonth(date)])
        .unwrap()
    )
    .map(attachMetadata(Handler.MONTH));
};
