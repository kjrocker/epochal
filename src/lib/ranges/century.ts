import { handleCentury } from "../century";
import { Maybe } from "../util/maybe";
import { InputHandler } from "../util/util";
import { matchDash, matchTo } from "./util";

const hasCentury = (text: string): string | null => {
  const match = text.match(/century(?<startEra>\s+(?:bc|ad|bce|ce))?$/);
  return match ? match[0] : null;
};
export const matchCenturyRange = (input: string): [string, string] | null => {
  const centuryMatch = hasCentury(input);
  if (!centuryMatch) return null;
  return Maybe.fromValue(input)
    .tryEach(
      (text) => matchTo(text),
      (text) => matchDash(text)
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
    .tryEach((text) => matchCenturyRange(text))
    .map(([start, end]) => {
      const startRange = handleCentury(Maybe.fromValue(start), options).get();
      const endRange = handleCentury(Maybe.fromValue(end), options).get();
      if (!startRange || !endRange) return null;
      return [startRange[0], endRange[1], startRange[2]];
    });
};
