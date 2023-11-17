import { endOfMillenium, startOfMillenium } from "../date-fns";
import { Maybe } from "./maybe";

//   [/^([0-9]+)[A-Za-z]*\s+(century|Cen|cen)$/, century],
//   [/^([0-9]+)[A-Za-z]*\s+(century|Cen|cen)\s*(\w+)$/, century],
//   [/^([0-9]+)[A-Za-z]*\s+(millenium|mil|m)$/, millenium],
//   /^([0-9]+)[A-Za-z]*\s+(millenium|mil|m)\s*(\w+)$/

// Convert a millenium string to an integer, positive for AD, negative for BC
const milleniumToOrdinal = (text: string): number | null => {
  const matches = text.match(/^([0-9]+)[a-z]*\s+(millenium|mil|m)\s*(\w+)$/);
  console.log("Matches: ", matches);
  return matches ? Number.parseInt(matches[1]) : null;
};

// Convert a millenium number to a date by adding/subtracting 1000 years from 1500 AD
const MILLENIUM_OFFSET = 1000 * 60 * 60 * 24 * 365.25 * 1000;
const milleniumToDate = (millenium: number): Date | null => {
  if (!millenium) return null;
  const midpoint = -14831769600000; // January 1st, 1500...
  const midpointIndex = 2; // ...in the 2nd millenium
  return new Date(midpoint + (millenium - midpointIndex) * MILLENIUM_OFFSET);
};

export const handleMillenium = (input: Maybe<string>): Maybe<[Date, Date]> => {
  return input
    .flatMap((string) => Maybe.fromValue(milleniumToOrdinal(string)))
    .flatMap((ordinal) => Maybe.fromValue(milleniumToDate(ordinal)))
    .flatMap((date) =>
      Maybe.fromValue([startOfMillenium(date), endOfMillenium(date)])
    );
};
