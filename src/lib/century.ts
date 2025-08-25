import { endOfCentury, startOfCentury } from "./date-fns";
import { attachMetadata, InputHandler, Handler } from "./util/util";
import { Modifier, ModifierConfig } from "./util/modifier";
import { EpochizeOptions } from "./util/options";
import { add, sub } from "date-fns";
import { firstThirdModifier, secondThirdModifier, thirdThirdModifier } from "./modifiers/partials";

const centuryToOrdinal = (text: string): number | null => {
  const eraMatches = text.match(
    /^(?<num>[0-9]+)[a-z]*\s+(?:century|cen)\s*(?<era>[a-z]*)$/
  );
  if (!eraMatches?.groups) return null;
  const { num, era } = eraMatches?.groups ?? { num: "", era: "" };
  if (era.startsWith("b")) {
    return Number.parseInt(num) * -1;
  } else {
    return Number.parseInt(num);
  }
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

const circaModifier = (options: EpochizeOptions): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /ca\.|c\.|circa/.test(text),
  extractor: (text) => text.replace(/ca\.|c\.|circa/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => [
    sub(dates[0], { years: options.circaStartOffset * 100 }),
    add(dates[1], { years: options.circaEndOffset * 100 }),
  ],
});

export const handleCentury: InputHandler = (input, options) => {
  return input
    .flatMap((text) =>
      Modifier.fromValue(text)
        .withModifier(circaModifier(options))
        .withModifier(firstThirdModifier())
        .withModifier(secondThirdModifier())
        .withModifier(thirdThirdModifier())
        .map((text) => centuryToOrdinal(text))
        .map((ordinal) => centuryToDate(ordinal))
        .map((date): [Date, Date] => [startOfCentury(date), endOfCentury(date)])
        .unwrap()
    )
    .map(attachMetadata(Handler.CENTURY));
};
