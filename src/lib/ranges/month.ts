import { handleMonth } from "../month";
import { Maybe } from "../util/maybe";
import { InputHandler } from "../util/util";
import { matchComma, matchDash, matchTo } from "./util";

const hasYear = (text: string): string | null => {
  const match = text.match(/\d+.*/);
  return match ? match[0] : null;
};
export const matchMonthRange = (input: string): [string, string] | null => {
  const yearMatch = hasYear(input);
  if (!yearMatch) return null;
  return Maybe.fromValue(input)
    .tryEach(matchTo, matchDash, matchComma)
    .map(([start, end]): [string, string] => {
      const startHasYear = hasYear(start);
      const newStart = startHasYear ? start : `${start} ${yearMatch}`;
      return [newStart, end];
    })
    .get();
};

export const handleMonthRange: InputHandler = (input, options) => {
  return input
    .tryEach((text) => matchMonthRange(text))
    .map(([start, end]) => {
      const startRange = handleMonth(Maybe.fromValue(start), options).get();
      const endRange = handleMonth(Maybe.fromValue(end), options).get();
      if (!startRange || !endRange) return null;
      return [startRange[0], endRange[1], startRange[2]];
    });
};
