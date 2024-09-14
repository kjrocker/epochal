import { clean, Metadata } from "./util/util";
import { handleCentury } from "./century";
import { handleDecade } from "./decade";
import { Maybe } from "./util/maybe";
import { handleMillenium } from "./millenium";
import { handleYear } from "./year";
import { handleMonth } from "./month";
import { handleDay } from "./day";
import { handlePartial } from "./partial";
import { handleRange } from "./range";

export const epochizeInner = (
  input: string
): Maybe<[Date, Date, Metadata]> => {
  const value = Maybe.fromValue(clean(input));
  return value.curvedTryEach<[Date, Date, Metadata]>(
    (text) => handleRange(text),
    (text) => handlePartial(text),
    (text) => handleMonth(text),
    (text) => handleDay(text),
    (text) => handleYear(text),
    (text) => handleDecade(text),
    (text) => handleCentury(text),
    (text) => handleMillenium(text)
  );
};

export const epochize = (input: string): [Date, Date] | null => {
  const result = epochizeInner(input).get()
  if (result === null) return null;
  return [result[0], result[1]]
}
