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
  const myOptions = getOptions(options);
  const value = Maybe.fromValue(clean(input));
  return value.curvedTryEach<[Date, Date, Metadata]>(
    (text) => handleRange(text, myOptions),
    (text) => handlePartial(text, myOptions),
    (text) => handleMonth(text, myOptions),
    (text) => handleDay(text, myOptions),
    (text) => handleYear(text, myOptions),
    (text) => handleDecade(text, myOptions),
    (text) => handleCentury(text, myOptions),
    (text) => handleMillenium(text, myOptions)
  );
};

type Epochize = (input: string, options?: Partial<EpochizeOptions>) => [Date, Date] | null;

export const epochize: Epochize = (input, options) => {
  const result = epochizeInner(input, options).get()
  if (result === null) return null;
  return [result[0], result[1]]
}

export const createEpochize = (options?: EpochizeOptions): Epochize => (input, myOptions) => {
  return epochize(input, { ...(options ?? {}), ...(myOptions ?? {}) });
}