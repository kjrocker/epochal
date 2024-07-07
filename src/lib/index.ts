import { clean } from "./util/util";
import { handleCentury } from "./century";
import { handleDecade } from "./decade";
import { Maybe } from "./util/maybe";
import { handleMillenium } from "./millenium";
import { handleYear } from "./year";
import { handleMonth } from "./month";
import { handleDay } from "./day";
import { Tuple } from "./util/tuple";
import { handlePartial } from "./partial";

export const epochizeMaybeTuple = (
  input: string
): Maybe<Tuple<[Date, Date]>> => {
  const value = Maybe.fromValue(clean(input));
  return value.curvedTryEach<Tuple<[Date, Date]>>(
    (text) => handlePartial(text),
    (text) => handleMonth(text),
    (text) => handleDay(text),
    (text) => handleYear(text),
    (text) => handleDecade(text),
    (text) => handleCentury(text),
    (text) => handleMillenium(text)
  );
};

// Unwrapping the types to various degrees for testing/debugging/type purposes.
export const epochizeTuple = (input: string): Tuple<[Date, Date]> | null =>
  epochizeMaybeTuple(input).get();

export const epochize = (input: string): [Date, Date] | null =>
  epochizeTuple(input)?.value ?? null;
