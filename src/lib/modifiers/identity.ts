import { ModifierConfig } from "../util/modifier";
import { getMonthPattern } from "../util/regex";
import { InputHandlerReturn } from "../util/util";

export const leadingWordModifier = (): ModifierConfig<
  string,
  InputHandlerReturn
> => ({
  predicate: (text) => {
    const hasLeadingWords = /^([A-Za-z]+\s+)+/.test(text);
    if (!hasLeadingWords) return false;

    const monthAtStart = new RegExp(`^${getMonthPattern()}\\s+`, "i");
    return !monthAtStart.test(text);
  },
  extractor: (text) => {
    const monthPattern = new RegExp(`\\b${getMonthPattern()}\\b`, "gi");
    const words = text.split(/\s+/);
    const filteredWords = words.filter((word) => {
      return monthPattern.test(word) || !/^[A-Za-z]+$/.test(word);
    });
    return filteredWords.join(" ").trim();
  },
  transformer: (dates) => dates,
});

const PRINTED_PATTERN = /,\s*printed.*/;
export const printedModifier = (): ModifierConfig<
  string,
  InputHandlerReturn
> => ({
  predicate: (text) => PRINTED_PATTERN.test(text),
  extractor: (text) => text.replace(PRINTED_PATTERN, "").trim(),
  transformer: (dates) => dates,
});

// eslint-disable-next-line no-useless-escape
export const PARENTHETICAL_PATTERN = /\s*[\(\[].*?[\)\]]\s*$/;
export const parentheticalModifier = (): ModifierConfig<
  string,
  InputHandlerReturn
> => ({
  predicate: (text) => PARENTHETICAL_PATTERN.test(text),
  extractor: (text) => text.replace(PARENTHETICAL_PATTERN, "").trim(),
  transformer: (dates) => dates,
});

const AFTER_ORIGINAL_PATTERN = /,\s*after\s+.*?\s+original$/;
export const afterOriginalModifier = (): ModifierConfig<
  string,
  InputHandlerReturn
> => ({
  predicate: (text) => AFTER_ORIGINAL_PATTERN.test(text),
  extractor: (text) => text.replace(AFTER_ORIGINAL_PATTERN, "").trim(),
  transformer: (dates) => dates,
});

export const circaIdentityModifier = (): ModifierConfig<
  string,
  InputHandlerReturn
> => ({
  predicate: (text) => /ca\.|c\.|circa/.test(text),
  extractor: (text) => text.replace(/ca\.|c\.|circa/, "").trim(),
  transformer: (dates: InputHandlerReturn): InputHandlerReturn => dates,
});
