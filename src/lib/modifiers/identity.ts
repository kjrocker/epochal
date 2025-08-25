import { ModifierConfig } from "../util/modifier";

const patterns = [
  /^dated\s+to\s+/,
  /^datable\s+to\s+/,
  /^dated\s+/,
  /^d\s+a\s+t\s+e\s+d\s+/,
  /^probably\s+/,
  /^possibly\s+/,
  /^likely\s+/,
  /^cast\s+/,
  /,\s*probably\s*$/,
  /^patented\s+/,
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
