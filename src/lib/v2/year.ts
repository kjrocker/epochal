import startOfYear from "date-fns/startOfYear";
import { Maybe } from "./maybe";
import endOfYear from "date-fns/endOfYear";
import { clean } from "../parser/util";

const eraMatch = (text: string): number | null => {
  const eraMatches = text.match(/^(?<num>[0-9]+)\s+(?<era>\w+)$/);
  if (!eraMatches?.groups) return null;
  const { num, era } = eraMatches?.groups;
  if (era.startsWith("b")) {
    return Number.parseInt(num) * -1;
  } else {
    return Number.parseInt(num);
  }
};

const noEraMatch = (text: string): number | null => {
  const noEraMatches = text.match(/^(?<num>[0-9]+)$/);
  if (!noEraMatches?.groups) return null;
  const { num } = noEraMatches?.groups;
  return Number.parseInt(num);
};

// Convert a millenium string to an integer, positive for AD, negative for BC
const yearToNumber = (text: string): Maybe<number> => {
  return Maybe.fromValue(clean(text)).flatTryEach(
    (text) => Maybe.fromValue(eraMatch(text)),
    (text) => Maybe.fromValue(noEraMatch(text))
  );
};

export const handleYear = (input: Maybe<string>): Maybe<[Date, Date]> => {
  return input
    .flatMap((string) => yearToNumber(string))
    .map((year) => {
      const date = new Date(year, 4, 1);
      date.setFullYear(year < 0 ? year + 1 : year);
      return date;
    })
    .map((date) => [startOfYear(date), endOfYear(date)]);
};
