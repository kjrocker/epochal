import { handleMillenium } from "../millenium";
import { PARENTHETICAL_PATTERN } from "../modifiers/identity";
import { Maybe } from "../util/maybe";
import { InputHandler } from "../util/util";
import { matchDash, matchTo } from "./util";

const hasMillenium = (text: string): string | null => {
  const match = text.match(
    /mille(n|nn)ium(?<startEra>\s+(?:bc|ad|bce|ce|b.c.|a.d.|b.c.e.|c.e.))?$/
  );
  return match ? match[0] : null;
};
export const matchMilleniumRange = (input: string): [string, string] | null => {
  const milleniumMatch = hasMillenium(input);
  if (!milleniumMatch) return null;
  return Maybe.fromValue(input)
    .tryEach(
      (text) => matchDash(text),
      (text) => matchTo(text)
    )
    .map(([start, end]): [string, string] => {
      const startHasMillenium = hasMillenium(start);
      const newStart = startHasMillenium ? start : `${start} ${milleniumMatch}`;
      return [newStart, end];
    })
    .get();
};

export const handleMilleniumRange: InputHandler = (input, options) => {
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
    .tryEach((text) => matchMilleniumRange(text))
    .map(([start, end]) => {
      const startRange = handleMillenium(Maybe.fromValue(start), options).get();
      const endRange = handleMillenium(Maybe.fromValue(end), options).get();
      if (!startRange || !endRange) return null;
      return [startRange[0], endRange[1], startRange[2]];
    });
};
