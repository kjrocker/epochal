import { handleDay } from "../day";
import { Maybe } from "../util/maybe";
import { InputHandler } from "../util/util";
import { matchDash, matchTo } from "./util";

const hasDate = (text: string): string | null => {
  // Look for year with optional era at the end of the string
  const match = text.match(
    /,?\s+(\d+(?:\s+(?:bc|ad|bce|ce|b\.c\.|a\.d\.|b\.c\.e\.|c\.e\.))?)\s*$/i
  );
  return match ? match[1] : null;
};

export const matchDayRange = (input: string): [string, string] | null => {
  const dateMatch = hasDate(input);
  if (!dateMatch) return null;

  return Maybe.fromValue(input)
    .tryEach(matchDash, matchTo)
    .map(([start, end]): [string, string] => {
      // Extract the month from the beginning of the input
      const monthMatch = input.match(/^(\w+)\s+/);
      if (!monthMatch) {
        return [start, end];
      }

      const month = monthMatch[1];
      let newStart = start.trim();
      let newEnd = end.trim();

      // For start: if it doesn't contain a comma, it's just "January 12" -> "January 12, 1920"
      if (!start.includes(",")) {
        newStart = `${newStart}, ${dateMatch}`;
      }

      // For end: if it contains a comma, it has year info like "19, 1920" -> "January 19, 1920"
      // If it doesn't contain a comma, it's just a day number like "19" -> "January 19, 1920"
      if (end.includes(",")) {
        // Parse the day and year from something like "19, 1920"
        const endParts = end.split(",");
        if (endParts.length === 2) {
          const day = endParts[0].trim();
          const year = endParts[1].trim();
          newEnd = `${month} ${day}, ${year}`;
        }
      } else {
        // Just a day number
        newEnd = `${month} ${end}, ${dateMatch}`;
      }

      return [newStart, newEnd];
    })
    .get();
};

export const handleDayRange: InputHandler = (input, options) => {
  return input
    .tryEach((text) => matchDayRange(text))
    .map(([start, end]) => {
      const startRange = handleDay(Maybe.fromValue(start), options).get();
      const endRange = handleDay(Maybe.fromValue(end), options).get();
      if (!startRange || !endRange) return null;
      return [startRange[0], endRange[1], startRange[2]];
    });
};
