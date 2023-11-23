import { endOfCentury, startOfCentury } from "./date-fns";
import { Maybe } from "./util/maybe";
import { Tuple } from "./util/tuple";
import { attachMetadata } from "./util/util";

const centuryToOrdinal = (text: string): number | null => {
  const eraMatches = text.match(
    /^(?<num>[0-9]+)[a-z]*\s+(?:century|cen)\s*(?<era>[a-z]*)$/
  );
  if (!eraMatches?.groups) return null;
  const { num, era } = eraMatches?.groups;
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

export const handleCentury = (
  input: Maybe<string>
): Maybe<Tuple<[Date, Date]>> => {
  return input
    .map((string) => centuryToOrdinal(string))
    .map((ordinal) => centuryToDate(ordinal))
    .map((date): [Date, Date] => [startOfCentury(date), endOfCentury(date)])
    .map(attachMetadata("handleCentury", input.getOrElse("")));
};
