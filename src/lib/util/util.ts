import { isDate } from "date-fns/isDate";
import { isValid } from "date-fns/isValid";
import { Maybe } from "./maybe";
import { EpochizeOptions } from "./options";

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

export enum Handler {
  RANGE = "handleRange",
  PARTIAL = "handlePartial",
  MONTH = "handleMonth",
  DAY = "handleDay",
  YEAR = "handleYear",
  DECADE = "handleDecade",
  CENTURY = "handleCentury",
  MILLENNIUM = "handleMillenium",
}

export interface Metadata {
  handler: Handler[];
  original: string;
  alternates?: [Date, Date, Omit<Metadata, "alternates">][];
  options?: EpochizeOptions;
}

export type InputHandler = (
  input: Maybe<string>,
  options: EpochizeOptions
) => Maybe<[Date, Date, Metadata]>;

const mergeMetadata = (base: Metadata, additional: Metadata): Metadata => {
  return {
    handler: [...base.handler, ...additional.handler],
    // Keep the original from the root call (base), not from nested calls
    original: base.original || additional.original,
  };
};

export const attachMetadata =
  (
    handler: Handler,
    original: string,
    additionalMeta: Partial<Metadata> = {}
  ) =>
  ([start, end, meta]: [Date, Date] | [Date, Date, Metadata]): [
    Date,
    Date,
    Metadata
  ] => {
    const baseMeta = meta ?? { handler: [], original: "" };
    const newMeta = { handler: [handler], original, ...additionalMeta };
    return [start, end, mergeMetadata(newMeta, baseMeta)];
  };

export const createMetadata = (
  handler: Handler,
  original: string,
  additionalMeta: Partial<Metadata> = {}
): Metadata => {
  return {
    handler: [handler],
    original,
    ...additionalMeta,
  };
};

export const mergeMetadataPublic = mergeMetadata;

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
