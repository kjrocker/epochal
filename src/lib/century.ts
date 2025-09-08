import { endOfCentury, startOfCentury } from "./date-fns";
import {
  afterOriginalModifier,
  parentheticalModifier,
} from "./modifiers/identity";
import {
  earlyMidLateModifier,
  firstHalfModifier,
  firstQuarterModifier,
  fourthQuarterModifier,
  secondHalfModifier,
  secondQuarterModifier,
  thirdQuarterModifier,
} from "./modifiers/partials";
import { Modifier, ModifierConfig } from "./util/modifier";
import { EpochizeOptions } from "./util/options";
import { attachMetadata, Handler, InputHandler } from "./util/util";

const parseEraAndNumber = (num: string, era: string): number => {
  const parsedNum = Number.parseInt(num);
  return era.toLowerCase().startsWith("b") ? parsedNum * -1 : parsedNum;
};

const centuryToOrdinal = (text: string): number | null => {
  // Try pattern: "A.D. 2nd century" (era at beginning)
  const frontEraMatches = text.match(
    /^(?<era>[a-z.]+)\s+(?<num>[0-9]+)[a-z]*\s+(?:century|centuries|century\?|centuries\?)$/i
  );
  if (frontEraMatches?.groups) {
    const { num, era } = frontEraMatches.groups;
    return parseEraAndNumber(num, era);
  }

  // Try pattern: "2nd century A.D." (era at end)
  const endEraMatches = text.match(
    /^(?<num>[0-9]+)[a-z]*\s+(?:century|centuries|century\?|centuries\?)\s*(?<era>[a-z.]*)$/i
  );
  if (endEraMatches?.groups) {
    const { num, era } = endEraMatches.groups;
    return parseEraAndNumber(num, era);
  }

  return null;
};

const CENTURY_LENGTH = 1000 * 60 * 60 * 24 * 365.25 * 100;
const CENTURY_MIDPOINT = -631152000000; // January 1st, 1950...
const CENTURY_MIDPOINT_INDEX = 20; // ...in the 20th century

// Convert a century number to a date by adding/subtracting 1000 years from 1500 AD
const centuryToDate = (century: number): Date | null => {
  if (!century) return null;
  const offset =
    ((century < 0 ? century + 1 : century) - CENTURY_MIDPOINT_INDEX) *
    CENTURY_LENGTH;
  return new Date(CENTURY_MIDPOINT + offset);
};

const CIRCA_REGEX = /ca\.|c\.|circa|ca/;
const circaModifier = (
  options: EpochizeOptions
): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => CIRCA_REGEX.test(text),
  extractor: (text) => text.replace(CIRCA_REGEX, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => dates,
});

const orLaterModifier = (
  options: EpochizeOptions
): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /(or|and) (later|earlier)/.test(text),
  extractor: (text) => text.replace(/(or|and) (later|earlier)/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => dates,
});

export const handleCentury: InputHandler = (input, options) => {
  return input
    .flatMap((text) =>
      Modifier.fromValue(text)
        .withModifier(circaModifier(options))
        .withModifier(orLaterModifier(options))
        .withModifier(parentheticalModifier())
        .withModifier(afterOriginalModifier())
        .withModifier(firstHalfModifier())
        .withModifier(secondHalfModifier())
        .withModifier(earlyMidLateModifier())
        .withModifier(firstQuarterModifier())
        .withModifier(secondQuarterModifier())
        .withModifier(thirdQuarterModifier())
        .withModifier(fourthQuarterModifier())
        .map((text) => centuryToOrdinal(text))
        .map((ordinal) => centuryToDate(ordinal))
        .map((date): [Date, Date] => [
          startOfCentury(date, options),
          endOfCentury(date, options),
        ])
        .unwrap()
    )
    .map(attachMetadata(Handler.CENTURY));
};
