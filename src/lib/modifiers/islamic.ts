import { ModifierConfig } from "../util/modifier";

// Regular expressions for Islamic date patterns
const AH_TO_CE_PATTERN = /(?:\w+:?\s+)?a\.h\.\s+[?0-9–\-\sor]+\s*\//;
const CE_TO_AH_WITH_PARENS_PATTERN =
  /[0-9–\-\sor()?]+\s+ce\s*\([^)]*\)?\s*\/[0-9–\-\sor()?]*\s+a\.h\./;
const CE_TO_AH_PATTERN = /[0-9–\-\sor()?]+\s+ce\s*\/[0-9–\-\sor()?]*\s+a\.h\./;
const CE_GENERAL_PATTERN = /[0-9–\-\sor()?]+\s+ce.*\/.*a\.h\./;
const AH_REMOVAL_PATTERN = /(?:\w+:?\s+)?a\.h\.\s+[?0-9–\-\sor]+\s*\/\s*/;
const CE_TO_AH_REMOVAL_PATTERN = /\s*\/[0-9–\-\sor()?]*\s+a\.h\..*$/;

export const islamicModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) =>
    // Original pattern: "A.H. [date]/"
    AH_TO_CE_PATTERN.test(text) ||
    // Reverse pattern: "[date] CE/[number] A.H."
    CE_TO_AH_WITH_PARENS_PATTERN.test(text) ||
    CE_TO_AH_PATTERN.test(text),
  extractor: (text) => {
    // Try original pattern first: "A.H. [date]/ [CE date]"
    if (AH_TO_CE_PATTERN.test(text)) {
      return text.replace(AH_REMOVAL_PATTERN, "").trim();
    }
    // Try reverse pattern: "[CE date]/[number] A.H."
    else if (CE_GENERAL_PATTERN.test(text)) {
      return text.replace(CE_TO_AH_REMOVAL_PATTERN, "").trim();
    }
    return text;
  },
  transformer: (dates: [Date, Date]): [Date, Date] => dates,
});
