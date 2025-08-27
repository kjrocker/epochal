import { ModifierConfig } from "../util/modifier";

const halvesOfRange = (input: [Date, Date]): [Date, Date, Date] => {
  const [start, end] = input;
  const diff = end.getTime() - start.getTime();
  const half = diff / 2;
  return [start, new Date(start.getTime() + half), end];
};

const thirdsOfRange = (input: [Date, Date]): [Date, Date, Date, Date] => {
  const [start, end] = input;
  const diff = end.getTime() - start.getTime();
  const third = diff / 3;
  return [
    start,
    new Date(start.getTime() + third),
    new Date(start.getTime() + 2 * third),
    end,
  ];
};

const quartersOfRange = (input: [Date, Date]): [Date, Date, Date, Date, Date] => {
  const [start, end] = input;
  const diff = end.getTime() - start.getTime();
  const quarter = diff / 4;
  return [
    start,
    new Date(start.getTime() + quarter),
    new Date(start.getTime() + 2 * quarter),
    new Date(start.getTime() + 3 * quarter),
    end,
  ];
};

export const firstThirdModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /early/.test(text),
  extractor: (text) => text.replace(/early\s*/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [start, middle] = thirdsOfRange(dates);
    return [start, middle];
  },
});

export const secondThirdModifier = (): ModifierConfig<
  string,
  [Date, Date]
> => ({
  predicate: (text) => /mid[-\s]/.test(text),
  extractor: (text) => text.replace(/mid[-\s]*/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [start, middle, secondMiddle] = thirdsOfRange(dates);
    return [middle, secondMiddle];
  },
});

export const thirdThirdModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /\blate\b/.test(text),
  extractor: (text) => text.replace(/\blate\b\s*/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [start, middle, secondMiddle, end] = thirdsOfRange(dates);
    return [secondMiddle, end];
  },
});

export const firstHalfModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /first half\s+of\s*(?:the\s*)?/.test(text),
  extractor: (text) => text.replace(/first half\s+of\s*(?:the\s*)?/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [start, middle, _end] = halvesOfRange(dates);
    return [start, middle];
  },
});

export const secondHalfModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /second half\s+of\s*(?:the\s*)?/.test(text),
  extractor: (text) => text.replace(/second half\s+of\s*(?:the\s*)?/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [_start, middle, end] = halvesOfRange(dates);
    return [middle, end];
  },
});

export const firstQuarterModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /(?:first|1st) quarter of (?:the )?/.test(text),
  extractor: (text) => text.replace(/(?:first|1st) quarter of (?:the )?/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [start, firstQuarter] = quartersOfRange(dates);
    return [start, firstQuarter];
  },
});

export const secondQuarterModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /(?:second|2nd) quarter of (?:the )?/.test(text),
  extractor: (text) => text.replace(/(?:second|2nd) quarter of (?:the )?/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [_start, firstQuarter, secondQuarter] = quartersOfRange(dates);
    return [firstQuarter, secondQuarter];
  },
});

export const thirdQuarterModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /(?:third|3rd) quarter of (?:the )?/.test(text),
  extractor: (text) => text.replace(/(?:third|3rd) quarter of (?:the )?/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [_start, _firstQuarter, secondQuarter, thirdQuarter] = quartersOfRange(dates);
    return [secondQuarter, thirdQuarter];
  },
});

export const fourthQuarterModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /(?:fourth|4th|last) quarter of (?:the )?/.test(text),
  extractor: (text) => text.replace(/(?:fourth|4th|last) quarter of (?:the )?/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [_start, _firstQuarter, _secondQuarter, thirdQuarter, end] = quartersOfRange(dates);
    return [thirdQuarter, end];
  },
});
