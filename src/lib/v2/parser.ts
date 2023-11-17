import { clean } from "../parser/util";
import { Maybe } from "./maybe";
import { handleMillenium } from "./millenium";

export const epochize = (input: string): [Date, Date] | null => {
  return handleMillenium(
    Maybe.fromValue(input).flatMap((string) => Maybe.fromValue(clean(string)))
  ).get();
};
