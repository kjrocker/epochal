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

export type ValidationResult = 'exact' | 'approximate' | 'fail';

interface ValidationContext {
  epochStartYear: number;
  epochEndYear: number;
  beginDate: number;
  endDate: number;
  metadata: { handler?: Handler[]; original?: string };
  tolerances: ToleranceConfig;
}

// Validation predicate functions
const isExactMatch = ({ epochStartYear, epochEndYear, beginDate, endDate }: ValidationContext): boolean => {
  return epochStartYear === beginDate && epochEndYear === endDate;
};

const isCenturyWithinTolerance = ({ 
  epochStartYear, 
  epochEndYear, 
  beginDate, 
  endDate, 
  metadata, 
  tolerances 
}: ValidationContext): boolean => {
  const isCenturyOrMillennium = metadata.handler?.some(
    (h: Handler) =>
      h === Handler.CENTURY || h === Handler.MILLENNIUM || h === Handler.DECADE
  ) ?? false;
  
  if (!isCenturyOrMillennium) {
    return false;
  }

  const containsLate = /late/i.test(metadata?.original ?? "");
  const containsEarly = /early/i.test(metadata?.original ?? "");
  
  const startDiff = Math.abs(epochStartYear - beginDate);
  const endDiff = Math.abs(epochEndYear - endDate);
  
  return (
    startDiff <= Math.max(tolerances.century, containsLate ? tolerances.earlyLate : 0) &&
    endDiff <= Math.max(tolerances.century, containsEarly ? tolerances.earlyLate : 0)
  );
};

const isCircaWithinTolerance = ({ 
  epochStartYear, 
  epochEndYear, 
  beginDate, 
  endDate, 
  metadata, 
  tolerances 
}: ValidationContext): boolean => {
  const containsCirca = /ca\./i.test(metadata?.original ?? "");
  
  if (!containsCirca) {
    return false;
  }

  const circaStart = epochStartYear - tolerances.circa;
  const circaEnd = epochEndYear + tolerances.circa;
  
  return beginDate >= circaStart && endDate <= circaEnd;
};

export class ResultValidator {
  constructor(private tolerances: ToleranceConfig = {
    century: 10,
    earlyLate: 20,
    circa: 50
  }) {}

  validateResult(row: CSVRow, result: ProcessResult): ValidationResult {
    if (result.status !== 'success' || !result.epochStart || !result.epochEnd || !result.metadata) {
      return 'fail';
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
      return 'exact';
    }

    // Chain of approximate match predicates
    const approximatePredicates = [
      isCenturyWithinTolerance,
      isCircaWithinTolerance,
    ];

    // Return approximate if any predicate returns true
    const isApproximate = approximatePredicates.some(predicate => predicate(context));
    return isApproximate ? 'approximate' : 'fail';
  }

  // Backward compatibility method
  isResultPassing(row: CSVRow, result: ProcessResult): boolean {
    const validation = this.validateResult(row, result);
    return validation === 'exact' || validation === 'approximate';
  }
}