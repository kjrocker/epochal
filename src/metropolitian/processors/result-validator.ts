import { Handler } from "../../lib/util/util";
import { ProcessResult } from "./epoch-processor";

export interface CSVRow {
  [key: string]: string;
}

export interface ToleranceConfig {
  century: number;
  earlyLate: number;
  circa: number;
}

export type ValidationResult = "exact" | "approximate" | "fail";

interface ValidationContext {
  epochStartYear: number;
  epochEndYear: number;
  beginDate: number;
  endDate: number;
  metadata: { handler?: Handler[]; original?: string };
  tolerances: ToleranceConfig;
}

// Validation predicate functions
const isExactMatch = ({
  epochStartYear,
  epochEndYear,
  beginDate,
  endDate,
}: ValidationContext): boolean => {
  return epochStartYear === beginDate && epochEndYear === endDate;
};

const isCenturyWithinTolerance = ({
  epochStartYear,
  epochEndYear,
  beginDate,
  endDate,
  metadata,
  tolerances,
}: ValidationContext): boolean => {
  const isCenturyOrMillennium =
    metadata.handler?.some(
      (h: Handler) =>
        h === Handler.CENTURY ||
        h === Handler.MILLENNIUM ||
        h === Handler.DECADE
    ) ?? false;

  if (!isCenturyOrMillennium) {
    return false;
  }

  const containsLate = /late/i.test(metadata?.original ?? "");
  const containsEarly = /early/i.test(metadata?.original ?? "");

  const startDiff = Math.abs(epochStartYear - beginDate);
  const endDiff = Math.abs(epochEndYear - endDate);

  return (
    startDiff <=
      Math.max(tolerances.century, containsLate ? tolerances.earlyLate : 0) &&
    endDiff <=
      Math.max(tolerances.century, containsEarly ? tolerances.earlyLate : 0)
  );
};

const isByWithinTolerance = ({
  epochStartYear,
  epochEndYear,
  beginDate,
  endDate,
  metadata,
}: ValidationContext): boolean => {
  const containsBy = /by/i.test(metadata?.original ?? "");

  if (!containsBy) {
    return false;
  }

  const startDiff = Math.abs(epochStartYear - beginDate);
  const endDiff = Math.abs(epochEndYear - endDate);

  return startDiff <= 25 && endDiff <= 0;
};

const isLaterWithinTolerance = ({
  epochStartYear,
  epochEndYear,
  beginDate,
  endDate,
  metadata,
}: ValidationContext): boolean => {
  const containsBy = /later$/i.test(metadata?.original ?? "");

  if (!containsBy) {
    return false;
  }

  const startDiff = Math.abs(epochStartYear - beginDate);
  const endDiff = Math.abs(epochEndYear - endDate);

  return startDiff <= 1 && endDiff <= 30;
};

const isQuestionMarkWithinTolerance = ({
  epochStartYear,
  epochEndYear,
  beginDate,
  endDate,
  metadata,
}: ValidationContext): boolean => {
  const containsBy = /\(\?\)/i.test(metadata?.original ?? "");

  if (!containsBy) {
    return false;
  }

  const startDiff = Math.abs(epochStartYear - beginDate);
  const endDiff = Math.abs(epochEndYear - endDate);

  return startDiff <= 10 && endDiff <= 10;
};

const isBeforeWithinTolerance = ({
  epochStartYear,
  epochEndYear,
  beginDate,
  endDate,
  metadata,
}: ValidationContext): boolean => {
  const containsBy = /before/i.test(metadata?.original ?? "");

  if (!containsBy) {
    return false;
  }

  const startDiff = Math.abs(epochStartYear - beginDate);
  const endDiff = Math.abs(epochEndYear - endDate);

  return startDiff <= 25 && endDiff <= 1;
};

const isCircaWithinTolerance = ({
  epochStartYear,
  epochEndYear,
  beginDate,
  endDate,
  metadata,
  tolerances,
}: ValidationContext): boolean => {
  const containsCirca = /ca\./i.test(metadata?.original ?? "");

  if (!containsCirca) {
    return false;
  }

  // Only these handlers are valid targets for circa tolerance
  const handlerTolerances: Partial<Record<Handler, number>> = {
    [Handler.YEAR]: tolerances.circa,
    [Handler.CENTURY]: tolerances.circa * 10,
    [Handler.MILLENNIUM]: tolerances.circa * 100,
  };

  // Find the applicable tolerance from valid handlers only
  const applicableTolerance = metadata.handler?.find(
    (handler) => handler in handlerTolerances
  );

  // Abort if no valid handler found
  if (!applicableTolerance) {
    return false;
  }

  const tolerance = handlerTolerances[applicableTolerance];
  if (tolerance === undefined) {
    return false;
  }

  // Use absolute differences to account for BC dates
  const startDiff = Math.abs(epochStartYear - beginDate);
  const endDiff = Math.abs(epochEndYear - endDate);

  return startDiff <= tolerance && endDiff <= tolerance;
};

export class ResultValidator {
  constructor(
    private tolerances: ToleranceConfig = {
      century: 10,
      earlyLate: 20,
      circa: 50,
    }
  ) {}

  validateResult(row: CSVRow, result: ProcessResult): ValidationResult {
    if (
      result.status !== "success" ||
      !result.epochStart ||
      !result.epochEnd ||
      !result.metadata
    ) {
      return "fail";
    }

    const context: ValidationContext = {
      epochStartYear: result.epochStart.getFullYear(),
      epochEndYear: result.epochEnd.getFullYear(),
      beginDate: parseInt(row["Object Begin Date"]),
      endDate: parseInt(row["Object End Date"]),
      metadata: result.metadata as { handler?: Handler[]; original?: string },
      tolerances: this.tolerances,
    };

    // Check for exact match first
    if (isExactMatch(context)) {
      return "exact";
    }

    // Chain of approximate match predicates
    const approximatePredicates = [
      isCenturyWithinTolerance,
      isCircaWithinTolerance,
      isByWithinTolerance,
      isQuestionMarkWithinTolerance,
      isLaterWithinTolerance,
      isBeforeWithinTolerance,
    ];

    // Return approximate if any predicate returns true
    const isApproximate = approximatePredicates.some((predicate) =>
      predicate(context)
    );
    return isApproximate ? "approximate" : "fail";
  }

  // Backward compatibility method
  isResultPassing(row: CSVRow, result: ProcessResult): boolean {
    const validation = this.validateResult(row, result);
    return validation === "exact" || validation === "approximate";
  }
}
