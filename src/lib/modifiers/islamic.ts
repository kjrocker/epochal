import { ModifierConfig } from "../util/modifier";

export const islamicModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /(?:\w+:?\s+)?a\.h\.\s+[?0-9–\-\sor]+\//.test(text),
  extractor: (text) => text.replace(/(?:\w+:?\s+)?a\.h\.\s+[?0-9–\-\sor]+\/\s*/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => dates,
});
