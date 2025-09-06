import { Maybe } from "../util/maybe";
import { InputHandler } from "../util/util";
import { handleYear } from "../year";
import { matchDash } from "./util";

const numbersBehaveLikeShorthand = (start: number, end: number): boolean => {
  if (end % 100 === end && end % 100 > start % 100) {
    return true;
  } else if (end % 10 === end && end % 10 > start % 10) {
    return true;
  }
  return false;
};

export const matchYearShorthand = (input: string): [string, string] | null => {
  const matches = matchDash(input);
  if (!matches) return null;
  const [startString, endString] = matches;

  // Extract trailing digits from start and leading digits from end
  const startMatch = startString.match(/(\d+)$/);
  const endMatch = endString.match(/^(\d+)/);

  if (!startMatch || !endMatch) return null;

  const startNum = parseInt(startMatch[1]);
  const endNum = parseInt(endMatch[1]);

  // Check if these numbers behave like shorthand notation
  if (numbersBehaveLikeShorthand(startNum, endNum)) {
    // Construct the full end year by appending missing digits from start
    const startYear = startMatch[1];
    const endYear = endMatch[1];

    // Calculate how many digits to take from start
    const digitsToTake = startYear.length - endYear.length;
    const prefix = startYear.substring(0, digitsToTake);
    const fullEndYear = prefix + endYear;

    // Replace just the number in the end string with the expanded year
    const expandedEndString = endString.replace(endMatch[1], fullEndYear);

    return [startString.trim(), expandedEndString.trim()];
  }

  return null;
};

export const handleYearRange: InputHandler = (input, options) => {
  return input
    .tryEach((text) => matchYearShorthand(text))
    .map(([start, end]) => {
      const startRange = handleYear(Maybe.fromValue(start), options).get();
      const endRange = handleYear(Maybe.fromValue(end), options).get();
      if (!startRange || !endRange) return null;
      return [startRange[0], endRange[1], startRange[2]];
    });
};
