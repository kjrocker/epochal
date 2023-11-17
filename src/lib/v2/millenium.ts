import { endOfMillenium, startOfMillenium } from "../date-fns";
import { Maybe } from "./maybe";

const eraMatch = (text: string): number | null => {
  const eraMatches = text.match(
    /^(?<num>[0-9]+)[a-z]*\s+(?:millennium|millenium|mill)\s+(?<era>\w+)$/
  );
  if (!eraMatches?.groups) return null;
  const { num, era } = eraMatches?.groups;
  if (era.startsWith("b")) {
    return Number.parseInt(num) * -1;
  } else {
    return Number.parseInt(num);
  }
};

const noEraMatch = (text: string): number | null => {
  const noEraMatches = text.match(
    /^(?<num>[0-9]+)[a-z]*\s+(?:millennium|millenium|mill)$/
  );
  if (!noEraMatches?.groups) return null;
  const { num } = noEraMatches?.groups;
  return Number.parseInt(num);
};

// Convert a millenium string to an integer, positive for AD, negative for BC
const milleniumToOrdinal = (text: string): Maybe<number> => {
  return Maybe.fromValue(text).tryEach(
    (text) => Maybe.fromValue(eraMatch(text)),
    (text) => Maybe.fromValue(noEraMatch(text))
  );
};

const MILLENIUM_LENGTH = 1000 * 60 * 60 * 24 * 365.25 * 1000;
const MILLENIUM_MIDPOINT = -14831769600000; // January 1st, 1500...
const MILLENIUM_MIDPOINT_INDEX = 2; // ...in the 2nd millenium

// Convert a millenium number to a date by adding/subtracting 1000 years from 1500 AD
const milleniumToDate = (millenium: number): Date | null => {
  if (!millenium) return null;
  const offset =
    ((millenium < 0 ? millenium + 1 : millenium) - MILLENIUM_MIDPOINT_INDEX) *
    MILLENIUM_LENGTH;
  return new Date(MILLENIUM_MIDPOINT + offset);
};

export const handleMillenium = (input: Maybe<string>): Maybe<[Date, Date]> => {
  return input
    .flatMap((string) => milleniumToOrdinal(string))
    .flatMap((ordinal) => Maybe.fromValue(milleniumToDate(ordinal)))
    .flatMap((date) =>
      Maybe.fromValue([startOfMillenium(date), endOfMillenium(date)])
    );
};
