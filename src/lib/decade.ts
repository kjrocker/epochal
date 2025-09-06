import { endOfDecade, startOfDecade } from "./date-fns";
import { Maybe } from "./util/maybe";
import { attachMetadata, InputHandler, Handler } from "./util/util";
import { Modifier, ModifierConfig } from "./util/modifier";
import { EpochizeOptions } from "./util/options";
import { add, sub } from "date-fns";
import {
  firstThirdModifier,
  secondThirdModifier,
  thirdThirdModifier,
} from "./modifiers/partials";
import { identityModifier } from "./modifiers/identity";

const eraMatch = (text: string): number | null => {
  const eraMatches = text.match(/^(?<num>[0-9]+)s\s*(?<era>[a-z]*)$/);
  if (!eraMatches?.groups) return null;
  const { num, era } = eraMatches?.groups ?? { num: "", era: "" };
  const numInt = Number.parseInt(num) / 10 + 1;
  if (era.startsWith("b")) {
    return numInt * -1;
  } else {
    return numInt;
  }
};

// Convert a decade string to an integer, positive for AD, negative for BC
const decadeToOrdinal = (text: string): Maybe<number> => {
  return Maybe.fromValue(text).map((text) => eraMatch(text));
};

const DECADE_LENGTH = 1000 * 60 * 60 * 24 * 365.25 * 10;
const DECADE_MIDPOINT = 157770000000; // January 1st, 1975...
const DECADE_MIDPOINT_INDEX = 198; // ...in the 198th decade

// Convert a decade number to a date by adding/subtracting 1000 years from 1500 AD
const decadeToDate = (decade: number): Date | null => {
  if (!decade) return null;
  const offset =
    ((decade < 0 ? decade + 1 : decade) - DECADE_MIDPOINT_INDEX) *
    DECADE_LENGTH;
  return new Date(DECADE_MIDPOINT + offset);
};

const circaModifier = (
  options: EpochizeOptions
): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /ca\.|c\.|circa/.test(text),
  extractor: (text) => text.replace(/ca\.|c\.|circa/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => [
    sub(dates[0], { years: options.circaStartOffset * 10 }),
    add(dates[1], { years: options.circaEndOffset * 10 }),
  ],
});

export const handleDecade: InputHandler = (input, options) => {
  return input
    .flatMap((text) =>
      Modifier.fromValue(text)
        .withModifier(circaModifier(options))
        .withModifier(identityModifier())
        .withModifier(firstThirdModifier())
        .withModifier(secondThirdModifier())
        .withModifier(thirdThirdModifier())
        .flatMap(decadeToOrdinal)
        .map(decadeToDate)
        .map((date): [Date, Date] => [startOfDecade(date), endOfDecade(date)])
        .unwrap()
    )
    .map(attachMetadata(Handler.DECADE));
};
