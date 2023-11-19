import { clean } from "./util";
import { handleCentury } from "./century";
// import { handleDecade } from "./decade";
import { Maybe } from "./maybe";
import { handleMillenium } from "./millenium";
import { handleYear } from "./year";

export const epochize = (input: string): [Date, Date] | null => {
  const value = Maybe.fromValue(clean(input));
  return value
    .curvedTryEach<[Date, Date]>(
      (text) => handleYear(text),
      // (text) => handleDecade(Maybe.fromValue(text)),
      (text) => handleMillenium(text),
      (text) => handleCentury(text)
    )
    .get();
};
