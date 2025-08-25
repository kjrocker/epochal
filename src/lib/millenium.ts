import { endOfMillenium, startOfMillenium } from "./date-fns";
import { attachMetadata, InputHandler, Handler } from "./util/util";
import { Modifier, ModifierConfig } from "./util/modifier";
import { EpochizeOptions } from "./util/options";
import { add, sub } from "date-fns";
import {
  firstThirdModifier,
  secondThirdModifier,
  thirdThirdModifier,
} from "./modifiers/partials";

const milleniumToOrdinal = (text: string): number | null => {
  const eraMatches = text.match(
    /^(?<num>[0-9]+)[a-z]*\s+(?:millennium|millenium|mill)\s*(?<era>[a-z]*)$/
  );
  if (!eraMatches?.groups) return null;
  const { num, era } = eraMatches?.groups ?? { num: "", era: "" };
  if (era.startsWith("b")) {
    return Number.parseInt(num) * -1;
  } else {
    return Number.parseInt(num);
  }
};

const MILLENIUM_LENGTH = 1000 * 60 * 60 * 24 * 365.25 * 1000;
const MILLENIUM_MIDPOINT = -14831769600000; // January 1st, 1500...
const MILLENIUM_MIDPOINT_INDEX = 2; // ...in the 2nd millenium

// Convert a millenium number to a date by adding/subtracting 1000 years from 1500 AD
const milleniumToDate = (millenium: number): Date => {
  const offset =
    ((millenium < 0 ? millenium + 1 : millenium) - MILLENIUM_MIDPOINT_INDEX) *
    MILLENIUM_LENGTH;
  return new Date(MILLENIUM_MIDPOINT + offset);
};

const circaModifier = (
  options: EpochizeOptions
): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /ca\.|c\.|circa/.test(text),
  extractor: (text) => text.replace(/ca\.|c\.|circa/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => [
    sub(dates[0], { years: options.circaStartOffset * 1000 }),
    add(dates[1], { years: options.circaEndOffset * 1000 }),
  ],
});

export const handleMillenium: InputHandler = (input, options) => {
  return input
    .flatMap((text) =>
      Modifier.fromValue(text)
        .withModifier(circaModifier(options))
        .withModifier(firstThirdModifier())
        .withModifier(secondThirdModifier())
        .withModifier(thirdThirdModifier())
        .map(milleniumToOrdinal)
        .map(milleniumToDate)
        .map((date): [Date, Date] => [
          startOfMillenium(date),
          endOfMillenium(date),
        ])
        .unwrap()
    )
    .map(attachMetadata(Handler.MILLENNIUM));
};
