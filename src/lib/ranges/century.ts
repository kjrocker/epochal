import { handleCentury } from "../century";
import { PARENTHETICAL_PATTERN } from "../modifiers/identity";
import { Maybe } from "../util/maybe";
import { InputHandler } from "../util/util";
import { matchDash, matchSlash, matchTo } from "./util";

const hasCentury = (text: string): string | null => {
  const match = text.match(
    /(century|centuries|century\?|centuries\?)(?<startEra>\s+(?:bc|ad|bce|ce|b.c.|a.d.|b.c.e.|c.e.|b.c|a.d))?$/
  );
  return match ? match[0] : null;
};
export const matchCenturyRange = (input: string): [string, string] | null => {
  const centuryMatch = hasCentury(input);
  if (!centuryMatch) return null;
  return Maybe.fromValue(input)
    .tryEach(
      (text) => matchDash(text),
      (text) => matchSlash(text),
      (text) => matchTo(text)
    )
    .map(([start, end]): [string, string] => {
      const startHasCentury = hasCentury(start);
      const newStart = startHasCentury ? start : `${start} ${centuryMatch}`;
      return [newStart, end];
    })
    .get();
};

export const handleCenturyRange: InputHandler = (input, options) => {
  return input
    .map((text) => {
      return /(or|and) later/.test(text)
        ? text.replace(/(or|and) later/, "").trim()
        : text.trim();
    })
    .map((text) =>
      PARENTHETICAL_PATTERN.test(text)
        ? text.replace(PARENTHETICAL_PATTERN, "").trim()
        : text.trim()
    )
    .tryEach((text) => matchCenturyRange(text))
    .map(([start, end]) => {
      const startRange = handleCentury(Maybe.fromValue(start), options).get();
      const endRange = handleCentury(Maybe.fromValue(end), options).get();
      if (!startRange || !endRange) return null;
      return [startRange[0], endRange[1], startRange[2]];
    });
};
