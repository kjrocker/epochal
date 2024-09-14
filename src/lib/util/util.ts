import { isDate } from "date-fns/isDate";
import { isValid } from "date-fns/isValid";
import { Maybe } from "./maybe";

export const clean = (str: string): string | null => {
  if (!str) return null;
  const cleaned = str.trim().toLowerCase();
  if (!cleaned || cleaned === "") return null;
  return cleaned;
};

export const isValidDate = (d: Date) => (isDate(d) && isValid(d) ? d : null);

export const lookupMonth = (month: string): number => {
  switch (month) {
    case "january":
    case "jan":
      return 1;
    case "february":
    case "feb":
      return 2;
    case "march":
    case "mar":
      return 3;
    case "april":
    case "apr":
      return 4;
    case "may":
      return 5;
    case "june":
    case "jun":
      return 6;
    case "july":
    case "jul":
      return 7;
    case "august":
    case "aug":
      return 8;
    case "september":
    case "sep":
      return 9;
    case "october":
    case "oct":
      return 10;
    case "november":
    case "nov":
      return 11;
    case "december":
    case "dec":
      return 12;
    default:
      return 0;
  }
};

export interface Metadata {
  handler: string[];
  original: string;
}

export type InputHandler = (input: Maybe<string>) => Maybe<[Date, Date, Metadata]>

const mergeMetadata = (original: Metadata, newer: Metadata): Metadata => {
  return {...original, ...newer, handler: original.handler.concat(...newer.handler)}
}

export const attachMetadata =
  (handler: string, original: string) => ([start, end, meta]: [Date, Date] | [Date, Date, Metadata]): [Date, Date, Metadata] => 
    [start, end, mergeMetadata(meta ?? {handler: [], original: ''}, {handler: [handler], original})]
     
