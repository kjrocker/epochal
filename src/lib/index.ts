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
import { EpochizeOptions, getOptions } from "./util/options";

export const epochizeInner = (
  input: string, options?: Partial<EpochizeOptions>
): Maybe<[Date, Date, Metadata]> => {
  const _myOptions = getOptions(options);
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

type Epochize = (input: string, options?: Partial<EpochizeOptions>) => [Date, Date] | null;

export const epochize: Epochize = (input, options) => {
  const result = epochizeInner(input, options).get()
  if (result === null) return null;
  return [result[0], result[1]]
}

export const createEpochize = (options?: EpochizeOptions): Epochize => (input, myOptions): [Date, Date] | null => {
  return epochize(input, { ...(options ?? {}), ...(myOptions ?? {}) });
}