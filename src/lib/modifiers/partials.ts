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

const quartersOfRange = (
  input: [Date, Date]
): [Date, Date, Date, Date, Date] => {
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

const EARLY = /early/;
export const firstThirdModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => EARLY.test(text),
  extractor: (text) => text.replace(EARLY, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [start, middle] = thirdsOfRange(dates);
    return [start, middle];
  },
});

const MID = /mid[-\s]/;
export const secondThirdModifier = (): ModifierConfig<
  string,
  [Date, Date]
> => ({
  predicate: (text) => MID.test(text),
  extractor: (text) => text.replace(MID, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [start, middle, secondMiddle] = thirdsOfRange(dates);
    return [middle, secondMiddle];
  },
});

const LATE = /\blate\b/;
export const thirdThirdModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => LATE.test(text),
  extractor: (text) => text.replace(LATE, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [start, middle, secondMiddle, end] = thirdsOfRange(dates);
    return [secondMiddle, end];
  },
});

const FIRST_HALF = /(?:first|1st) half\s+(?:of\s*(?:the\s*)?)?/;
export const firstHalfModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => FIRST_HALF.test(text),
  extractor: (text) => text.replace(FIRST_HALF, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [start, middle, _end] = halvesOfRange(dates);
    return [start, middle];
  },
});

const SECOND_HALF = /(?:(?:second|2nd|last|latter) half\s+(?:of\s*(?:the\s*)?)?|end\s+of\s*(?:the\s*)?)/;
export const secondHalfModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => SECOND_HALF.test(text),
  extractor: (text) => text.replace(SECOND_HALF, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [_start, middle, end] = halvesOfRange(dates);
    return [middle, end];
  },
});

const FIRST_QUARTER = /(?:first|1st) quarter\s+(?:of\s*(?:the\s*)?)?/;
export const firstQuarterModifier = (): ModifierConfig<
  string,
  [Date, Date]
> => ({
  predicate: (text) => FIRST_QUARTER.test(text),
  extractor: (text) => text.replace(FIRST_QUARTER, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [start, firstQuarter] = quartersOfRange(dates);
    return [start, firstQuarter];
  },
});

const SECOND_QUARTER = /(?:second|2nd) quarter\s+(?:of\s*(?:the\s*)?)?/;
export const secondQuarterModifier = (): ModifierConfig<
  string,
  [Date, Date]
> => ({
  predicate: (text) => SECOND_QUARTER.test(text),
  extractor: (text) => text.replace(SECOND_QUARTER, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [_start, firstQuarter, secondQuarter] = quartersOfRange(dates);
    return [firstQuarter, secondQuarter];
  },
});

const THIRD_QUARTER = /(?:third|3rd) quarter\s+(?:of\s*(?:the\s*)?)?/;
export const thirdQuarterModifier = (): ModifierConfig<
  string,
  [Date, Date]
> => ({
  predicate: (text) => THIRD_QUARTER.test(text),
  extractor: (text) => text.replace(THIRD_QUARTER, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [_start, _firstQuarter, secondQuarter, thirdQuarter] =
      quartersOfRange(dates);
    return [secondQuarter, thirdQuarter];
  },
});

const FOURTH_QUARTER = /(?:fourth|4th|last) quarter\s+(?:of\s*(?:the\s*)?)?/;
export const fourthQuarterModifier = (): ModifierConfig<
  string,
  [Date, Date]
> => ({
  predicate: (text) => FOURTH_QUARTER.test(text),
  extractor: (text) => text.replace(FOURTH_QUARTER, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [_start, _firstQuarter, _secondQuarter, thirdQuarter, end] =
      quartersOfRange(dates);
    return [thirdQuarter, end];
  },
});

const MIDDLE_HALF = /(?:middle|mid) half\s+(?:of\s*(?:the\s*)?)?/;
export const middleHalfModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => MIDDLE_HALF.test(text),
  extractor: (text) => text.replace(MIDDLE_HALF, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [_start, firstQuarter, _secondQuarter, thirdQuarter, _end] =
      quartersOfRange(dates);
    return [firstQuarter, thirdQuarter];
  },
});
