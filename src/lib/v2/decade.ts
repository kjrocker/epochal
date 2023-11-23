import { endOfDecade, startOfDecade } from "../date-fns";
import { Maybe } from "./maybe";

const eraMatch = (text: string): number | null => {
  const eraMatches = text.match(/^(?<num>[0-9]+)s\s*(?<era>\w*)$/);
  if (!eraMatches?.groups) return null;
  const { num, era } = eraMatches?.groups;
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
const DECADE_MIDPOINT_INDEX = 198; // ...in the 20th decade

// Convert a decade number to a date by adding/subtracting 1000 years from 1500 AD
const decadeToDate = (decade: number): Date | null => {
  if (!decade) return null;
  const offset =
    ((decade < 0 ? decade + 1 : decade) - DECADE_MIDPOINT_INDEX) *
    DECADE_LENGTH;
  return new Date(DECADE_MIDPOINT + offset);
};

export const handleDecade = (input: Maybe<string>): Maybe<[Date, Date]> => {
  return input
    .flatMap(decadeToOrdinal)
    .map(decadeToDate)
    .map((date) => {
      return [startOfDecade(date), endOfDecade(date)];
    });
};
