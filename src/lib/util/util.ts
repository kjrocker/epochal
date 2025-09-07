import { isDate } from "date-fns/isDate";
import { isValid } from "date-fns/isValid";
import { Maybe } from "./maybe";
import { EpochizeOptions } from "./options";
import { clean } from "./clean";

export { clean };

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

export enum Handler {
  RANGE = "handleRange",
  PARTIAL = "handlePartial",
  MONTH = "handleMonth",
  DAY = "handleDay",
  YEAR = "handleYear",
  DECADE = "handleDecade",
  CENTURY = "handleCentury",
  MILLENNIUM = "handleMillenium",
  YEAR_RANGE = "handleYearRange",
  MODIFIER_PHRASE = "handleModifierPhrase",
}

export interface HandlerMetadata {
  handler: Handler[];
}

export interface ResultMetadata extends HandlerMetadata {
  alternates?: [Date, Date, Omit<ResultMetadata, "alternates">][];
  original?: string;
  options?: EpochizeOptions;
}

export type Metadata = ResultMetadata;

export type InputHandler = (
  input: Maybe<string>,
  options: EpochizeOptions
) => Maybe<[Date, Date, HandlerMetadata]>;

export const mergeMetadata = (
  base: HandlerMetadata,
  additional: HandlerMetadata
): HandlerMetadata => {
  return {
    handler: [...base.handler, ...additional.handler],
  };
};

export const attachMetadata =
  (handler: Handler, additionalMeta: Partial<HandlerMetadata> = {}) =>
  ([start, end, meta]: [Date, Date] | [Date, Date, HandlerMetadata]): [
    Date,
    Date,
    HandlerMetadata
  ] => {
    const baseMeta = meta ?? { handler: [] };
    const newMeta = { handler: [handler], ...additionalMeta };
    return [start, end, mergeMetadata(newMeta, baseMeta)];
  };

export const createMetadata = (
  handler: Handler,
  additionalMeta: Partial<HandlerMetadata> = {}
): HandlerMetadata => {
  return {
    handler: [handler],
    ...additionalMeta,
  };
};

export const getYearWithCenturyBreakpoint = (
  year: string,
  era: string,
  options: EpochizeOptions
): number => {
  if (!options.centuryShorthand) return Number.parseInt(year);
  if (era || year.length !== 2) return Number.parseInt(year);
  // No era, year exists, and year is two digits
  const baseYear = Number.parseInt(year);
  if (baseYear > options.centuryBreakpoint) {
    return baseYear + 1900;
  } else {
    return baseYear + 2000;
  }
};
