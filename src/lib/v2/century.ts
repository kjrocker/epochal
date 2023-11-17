import { endOfCentury, startOfCentury } from "../date-fns";
import { Maybe } from "./maybe";

const eraMatch = (text: string): number | null => {
  const eraMatches = text.match(
    /^(?<num>[0-9]+)[a-z]*\s+(?:century|cen)\s+(?<era>\w+)$/
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
  const noEraMatches = text.match(/^(?<num>[0-9]+)[a-z]*\s+(?:century|cen)$/);
  if (!noEraMatches?.groups) return null;
  const { num } = noEraMatches?.groups;
  return Number.parseInt(num);
};

// Convert a century string to an integer, positive for AD, negative for BC
const centuryToOrdinal = (text: string): Maybe<number> => {
  return Maybe.fromValue(text).tryEach(
    (text) => Maybe.fromValue(eraMatch(text)),
    (text) => Maybe.fromValue(noEraMatch(text))
  );
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

export const handleCentury = (input: Maybe<string>): Maybe<[Date, Date]> => {
  return input
    .flatMap((string) => centuryToOrdinal(string))
    .flatMap((ordinal) => Maybe.fromValue(centuryToDate(ordinal)))
    .flatMap((date) =>
      Maybe.fromValue([startOfCentury(date), endOfCentury(date)])
    );
};
