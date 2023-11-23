import { clean } from "./util/util";
import { handleCentury } from "./century";
import { handleDecade } from "./decade";
import { Maybe } from "./util/maybe";
import { handleMillenium } from "./millenium";
import { handleYear } from "./year";
import { handleMonth } from "./month";
import { handleDay } from "./day";

export const epochize = (input: string): [Date, Date] | null => {
  const value = Maybe.fromValue(clean(input));
  return value
    .curvedTryEach<[Date, Date]>(
      (text) => handleDay(text),
      (text) => handleMonth(text),
      (text) => handleYear(text),
      (text) => handleDecade(text),
      (text) => handleCentury(text),
      (text) => handleMillenium(text)
    )
    .get();
};
