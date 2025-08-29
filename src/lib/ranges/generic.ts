import { epochizeInner } from "../index";
import {
  attachMetadata,
  InputHandler,
  mergeMetadata,
  HandlerMetadata,
  Handler,
} from "../util/util";
import { EpochizeOptions } from "../util/options";

export const matchTo = (input: string): [string, string] | null => {
  // Check for mixed separators first - reject if found
  const hasTo = input.includes(" to ") || input.includes("to");
  const hasOr = input.includes(" or ") || input.includes("or");

  if (hasTo && hasOr) {
    return null; // Mixed separators not allowed
  }

  // First try splitting by " to " (with spaces)
  let matches = input.split(" to ");
  if (matches.length === 2) {
    return matches as [string, string];
  }

  // Then try splitting by " or " (with spaces)
  matches = input.split(" or ");
  if (matches.length === 2) {
    return matches as [string, string];
  }

  // Handle cases without spaces around separators
  matches = input.split("to");
  if (matches.length === 2) {
    return [matches[0].trim(), matches[1].trim()];
  }

  matches = input.split("or");
  if (matches.length === 2) {
    return [matches[0].trim(), matches[1].trim()];
  }

  return null;
};

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

const matchDash = (input: string): [string, string] | null => {
  // Match hyphen, en-dash, or em-dash
  const matches = input.split(/[-–—]/);
  if (matches.length !== 2) return null;
  return matches as [string, string];
};

const handleSplitStrings = (
  [first, second]: [string, string],
  options: EpochizeOptions
): [Date, Date, HandlerMetadata] | null => {
  const startResult = epochizeInner(first, options).get();

  // For the end part, if it contains circa indicators, swap the circa offsets so that
  // circaEndOffset gets applied to the end date instead of circaStartOffset
  const endOptions = /ca\.|c\.|circa/.test(second)
    ? {
        ...options,
        circaStartOffset: options.circaEndOffset,
        circaEndOffset: options.circaStartOffset,
      }
    : options;

  const endResult = epochizeInner(second, endOptions).get();
  if (startResult === null || endResult === null) return null;

  // Merge metadata from both parts of the range (extract HandlerMetadata part)
  const startHandlerMeta: HandlerMetadata = {
    handler: startResult[2].handler,
  };
  const endHandlerMeta: HandlerMetadata = {
    handler: endResult[2].handler,
  };
  const mergedMeta = mergeMetadata(startHandlerMeta, endHandlerMeta);

  return [startResult[0], endResult[1], mergedMeta];
};

export const handleGenericRange: InputHandler = (input, options) => {
  return input
    .tryEach(
      (text) => matchTo(text),
      (text) => matchYearShorthand(text),
      (text) => matchDash(text)
    )
    .map((parts) => handleSplitStrings(parts, options))
    .map(attachMetadata(Handler.RANGE));
};
