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
import { Modifier, ModifierConfig } from "./util/modifier";
import {
  firstHalfModifier,
  firstThirdModifier,
  secondThirdModifier,
  thirdThirdModifier,
} from "./modifiers/partials";

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

const circaModifier = (
  options: EpochizeOptions
): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /ca\.|c\.|circa/.test(text),
  extractor: (text) => text.replace(/ca\.|c\.|circa/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => [
    sub(dates[0], { years: options.circaStartOffset }),
    add(dates[1], { years: options.circaEndOffset }),
  ],
});

export const handleYear: InputHandler = (input, options) => {
  return input
    .flatMap((text) =>
      Modifier.fromValue(text)
        .withModifier(circaModifier(options))
        .withModifier(firstThirdModifier())
        .withModifier(secondThirdModifier())
        .withModifier(thirdThirdModifier())
        .flatMap((text) => yearToNumber(text, options))
        .map((num) => yearToDate(num))
        .map((year): [Date, Date] => [startOfYear(year), endOfYear(year)])
        .unwrap()
    )
    .map(attachMetadata(Handler.YEAR));
};
