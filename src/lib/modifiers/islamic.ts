import { ModifierConfig } from "../util/modifier";

export const islamicModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /(?:\w+\s+)?a\.h\.\s+\d+\//.test(text),
  extractor: (text) => text.replace(/(?:\w+\s+)?a\.h\.\s+\d+\//, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => dates,
});
