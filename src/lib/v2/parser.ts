import { clean } from "../parser/util";
import { handleCentury } from "./century";
import { Maybe } from "./maybe";
import { handleMillenium } from "./millenium";

export const epochize = (input: string): [Date, Date] | null => {
  const value = Maybe.fromValue(clean(input));
  return value
    .tryEach<[Date, Date]>(
      (text) => handleMillenium(Maybe.fromValue(text)),
      (text) => handleCentury(Maybe.fromValue(text))
    )
    .get();
};
