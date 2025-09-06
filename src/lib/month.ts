import { endOfMonth } from "date-fns";
import { startOfMonth } from "date-fns/startOfMonth";
import {
  firstThirdModifier,
  secondThirdModifier,
  thirdThirdModifier,
} from "./modifiers/partials";
import { Maybe } from "./util/maybe";
import { Modifier } from "./util/modifier";
import { EpochizeOptions } from "./util/options";
import { EN_MONTHS } from "./util/regex";
import {
  attachMetadata,
  getYearWithCenturyBreakpoint,
  Handler,
  InputHandler,
  lookupMonth,
} from "./util/util";
import { identityModifier, parentheticalModifier } from "./modifiers/identity";

type GetMonthYear = (
  input: string,
  options: EpochizeOptions
) => { year: number; month: number } | null;

const getYear = (
  year: string,
  era: string,
  options: EpochizeOptions
): number => {
  if (era && era.startsWith("b")) return (Number.parseInt(year) - 1) * -1;
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

const textToYearAndMonth = (
  input: string,
  options: EpochizeOptions
): Maybe<{ year: number; month: number }> => {
  return Maybe.fromValue(input).tryEach((text) =>
    shortMonthNameYearEra(text, options)
  );
};

export const handleMonth: InputHandler = (input, options) => {
  return input
    .flatMap((text) =>
      Modifier.fromValue(text)
        .withModifier(identityModifier())
        .withModifier(parentheticalModifier())
        .withModifier(firstThirdModifier())
        .withModifier(secondThirdModifier())
        .withModifier(thirdThirdModifier())
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
