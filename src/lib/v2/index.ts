import { clean } from "./util/util";
import { handleCentury } from "./century";
import { handleDecade } from "./decade";
import { Maybe } from "./util/maybe";
import { handleMillenium } from "./millenium";
import { handleYear } from "./year";
import { handleMonth } from "./month";
import { handleDay } from "./day";
import { Tuple } from "./util/tuple";

export const epochizeMaybeTuple = (
  input: string
): Maybe<Tuple<[Date, Date]>> => {
  const value = Maybe.fromValue(clean(input));
  return value.curvedTryEach<Tuple<[Date, Date]>>(
    (text) => handleMonth(text),
    (text) => handleDay(text),
    (text) => handleYear(text),
    (text) => handleDecade(text),
    (text) => handleCentury(text),
    (text) => handleMillenium(text)
  );
};

export const epochizeTuple = (input: string): Tuple<[Date, Date]> | null =>
  epochizeMaybeTuple(input).get();

export const epochize = (input: string): [Date, Date] | null =>
  epochizeTuple(input)?.value ?? null;
