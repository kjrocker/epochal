import { ModifierConfig } from "../util/modifier";
import { EN_MONTHS } from "../util/regex";

const patterns = [
  /^dated\s+to\s+/,
  /^datable\s+to\s+/,
  /^dated\s+/,
  /^d\s+a\s+t\s+e\s+d\s+/,
  /^probably\s+/,
  /^possibly\s+/,
  /^likely\s+/,
  /^about\s+/,
  /^cast\s+/,
  /,\s*probably\s*$/,
  /^patented\s+/,
  /^dated,\s+/,
  /^undated,\s+/,
  /,\s*undated\s*$/,
  /^published\s+/,
  /^originally\s+published\s+/,
];
export const identityModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => patterns.some((pattern) => pattern.test(text)),
  extractor: (text) => {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return text.replace(pattern, "").trim();
      }
    }
    return text;
  },
  transformer: (dates) => dates,
});

export const leadingWordModifier = (): ModifierConfig<
  string,
  [Date, Date]
> => ({
  predicate: (text) => {
    const hasLeadingWords = /^([A-Za-z]+\s+)+/.test(text);
    if (!hasLeadingWords) return false;

    const monthAtStart = new RegExp(`^${EN_MONTHS.source}\\s+`, "i");
    return !monthAtStart.test(text);
  },
  extractor: (text) => {
    const monthPattern = new RegExp(`\\b${EN_MONTHS.source}\\b`, "gi");
    const words = text.split(/\s+/);
    const filteredWords = words.filter((word) => {
      return monthPattern.test(word) || !/^[A-Za-z]+$/.test(word);
    });
    return filteredWords.join(" ").trim();
  },
  transformer: (dates) => dates,
});

const PRINTED_PATTERN = /,\s*printed.*/;
export const printedModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => PRINTED_PATTERN.test(text),
  extractor: (text) => text.replace(PRINTED_PATTERN, "").trim(),
  transformer: (dates) => dates,
});

// eslint-disable-next-line no-useless-escape
export const PARENTHETICAL_PATTERN = /\s*[\(\[].*?[\)\]]\s*$/;
export const parentheticalModifier = (): ModifierConfig<
  string,
  [Date, Date]
> => ({
  predicate: (text) => PARENTHETICAL_PATTERN.test(text),
  extractor: (text) => text.replace(PARENTHETICAL_PATTERN, "").trim(),
  transformer: (dates) => dates,
});

const AFTER_ORIGINAL_PATTERN = /,\s*after\s+.*?\s+original$/;
export const afterOriginalModifier = (): ModifierConfig<
  string,
  [Date, Date]
> => ({
  predicate: (text) => AFTER_ORIGINAL_PATTERN.test(text),
  extractor: (text) => text.replace(AFTER_ORIGINAL_PATTERN, "").trim(),
  transformer: (dates) => dates,
});

const ZODIAC_PATTERN =
  /\s+\w+\s+year(?=\s|$)|^year\s+of\s+the\s+\w+\s+|,\s*year\s+of\s+the\s+\w+\s*$/;
export const zodiacModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => ZODIAC_PATTERN.test(text),
  extractor: (text) => text.replace(ZODIAC_PATTERN, "").trim(),
  transformer: (dates) => dates,
});
