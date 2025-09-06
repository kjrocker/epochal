import { Maybe } from "../util/maybe";
import { InputHandler } from "../util/util";
import { handleYear } from "../year";
import { matchDash, matchSlash } from "./util";

const numbersBehaveLikeShorthand = (start: number, end: number): boolean => {
  if (end % 100 === end && end % 100 !== start % 100) {
    return true;
  } else if (end % 10 === end && end % 10 !== start % 10) {
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
    const endYear = endMatch[1];

    const multiplier = 10 ** endYear.length;
    const shouldIncrement = endNum < startNum % multiplier;
    const newPrefix =
      (Math.floor(startNum / multiplier) + (shouldIncrement ? 1 : 0)) *
      multiplier;
    const expandedEndString = (newPrefix + endNum).toString();

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
