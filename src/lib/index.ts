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
  input: string,
  options?: Partial<EpochizeOptions>
): Maybe<[Date, Date, Metadata]> => {
  const myOptions = getOptions(options);
  return Maybe.fromValue(clean(input))
    .tryMany<[Date, Date, Metadata]>(
      (text) => handleRange(Maybe.fromValue(text), myOptions),
      (text) => handlePartial(Maybe.fromValue(text), myOptions),
      (text) => handleMonth(Maybe.fromValue(text), myOptions),
      (text) => handleDay(Maybe.fromValue(text), myOptions),
      (text) => handleYear(Maybe.fromValue(text), myOptions),
      (text) => handleDecade(Maybe.fromValue(text), myOptions),
      (text) => handleCentury(Maybe.fromValue(text), myOptions),
      (text) => handleMillenium(Maybe.fromValue(text), myOptions)
    )
    .map(([first, ...rest]) => {
      return [
        first[0],
        first[1],
        { ...first[2], alternates: rest, options: myOptions },
      ];
    });
};

type Epochize = (
  input: string,
  options?: Partial<EpochizeOptions>
) => [Date, Date] | null;

export const epochize: Epochize = (input, options) => {
  const result = epochizeInner(input, options).get();
  if (result === null) return null;
  return [result[0], result[1]];
};

export const createEpochize =
  (options?: EpochizeOptions): Epochize =>
  (input, myOptions) => {
    return epochize(input, { ...(options ?? {}), ...(myOptions ?? {}) });
  };
