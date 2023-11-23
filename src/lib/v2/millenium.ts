import { endOfMillenium, startOfMillenium } from "../date-fns";
import { Maybe } from "./util/maybe";
import { Tuple } from "./util/tuple";
import { attachMetadata } from "./util/util";

const milleniumToOrdinal = (text: string): number | null => {
  const eraMatches = text.match(
    /^(?<num>[0-9]+)[a-z]*\s+(?:millennium|millenium|mill)\s*(?<era>[a-z]*)$/
  );
  if (!eraMatches?.groups) return null;
  const { num, era } = eraMatches?.groups;
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

export const handleMillenium = (
  input: Maybe<string>
): Maybe<Tuple<[Date, Date]>> => {
  return input
    .map(milleniumToOrdinal)
    .map(milleniumToDate)
    .map((date): [Date, Date] => [startOfMillenium(date), endOfMillenium(date)])
    .map(attachMetadata("handleMillenium", input.getOrElse("")));
};
