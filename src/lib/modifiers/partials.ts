import { ModifierConfig } from "../util/modifier";
import { InputHandlerReturn } from "../util/util";

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

const FIRST_HALF = /(?:first|1st) half\s+(?:of\s*(?:the\s*)?)?/;
export const firstHalfModifier = (): ModifierConfig<
  string,
  InputHandlerReturn
> => ({
  predicate: (text) => FIRST_HALF.test(text),
  extractor: (text) => text.replace(FIRST_HALF, "").trim(),
  transformer: ([first, second, meta]) => {
    const [start, middle, _end] = halvesOfRange([first, second]);
    return [start, middle, meta];
  },
});

const SECOND_HALF =
  /(?:(?:second|2nd|last|latter) half\s+(?:of\s*(?:the\s*)?)?|end\s+of\s*(?:the\s*)?)/;
export const secondHalfModifier = (): ModifierConfig<
  string,
  InputHandlerReturn
> => ({
  predicate: (text) => SECOND_HALF.test(text),
  extractor: (text) => text.replace(SECOND_HALF, "").trim(),
  transformer: ([first, second, meta]) => {
    const [_start, middle, end] = halvesOfRange([first, second]);
    return [middle, end, meta];
  },
});

const FIRST_QUARTER = /(?:first|1st) quarter\s+(?:of\s*(?:the\s*)?)?/;
export const firstQuarterModifier = (): ModifierConfig<
  string,
  InputHandlerReturn
> => ({
  predicate: (text) => FIRST_QUARTER.test(text),
  extractor: (text) => text.replace(FIRST_QUARTER, "").trim(),
  transformer: ([first, second, meta]) => {
    const [start, firstQuarter] = quartersOfRange([first, second]);
    return [start, firstQuarter, meta];
  },
});

const SECOND_QUARTER = /(?:second|2nd) quarter\s+(?:of\s*(?:the\s*)?)?/;
export const secondQuarterModifier = (): ModifierConfig<
  string,
  InputHandlerReturn
> => ({
  predicate: (text) => SECOND_QUARTER.test(text),
  extractor: (text) => text.replace(SECOND_QUARTER, "").trim(),
  transformer: ([first, second, meta]) => {
    const [_start, firstQuarter, secondQuarter] = quartersOfRange([
      first,
      second,
    ]);
    return [firstQuarter, secondQuarter, meta];
  },
});

const THIRD_QUARTER = /(?:third|3rd) quarter\s+(?:of\s*(?:the\s*)?)?/;
export const thirdQuarterModifier = (): ModifierConfig<
  string,
  InputHandlerReturn
> => ({
  predicate: (text) => THIRD_QUARTER.test(text),
  extractor: (text) => text.replace(THIRD_QUARTER, "").trim(),
  transformer: ([first, second, meta]) => {
    const [_start, _firstQuarter, secondQuarter, thirdQuarter] =
      quartersOfRange([first, second]);
    return [secondQuarter, thirdQuarter, meta];
  },
});

const FOURTH_QUARTER = /(?:fourth|4th|last) quarter\s+(?:of\s*(?:the\s*)?)?/;
export const fourthQuarterModifier = (): ModifierConfig<
  string,
  InputHandlerReturn
> => ({
  predicate: (text) => FOURTH_QUARTER.test(text),
  extractor: (text) => text.replace(FOURTH_QUARTER, "").trim(),
  transformer: ([first, second, meta]) => {
    const [_start, _firstQuarter, _secondQuarter, thirdQuarter, end] =
      quartersOfRange([first, second]);
    return [thirdQuarter, end, meta];
  },
});

const MIDDLE_HALF = /(?:middle|mid) half\s+(?:of\s*(?:the\s*)?)?/;
const MIDDLE_HALF_2 = /(?:middle)\s+(?:of\s*(?:the\s*)?)?/;
export const middleHalfModifier = (): ModifierConfig<
  string,
  InputHandlerReturn
> => ({
  predicate: (text) => MIDDLE_HALF.test(text) || MIDDLE_HALF_2.test(text),
  extractor: (text) =>
    MIDDLE_HALF.test(text)
      ? text.replace(MIDDLE_HALF, "").trim()
      : text.replace(MIDDLE_HALF_2, ""),
  transformer: ([first, second, meta]) => {
    const [_start, firstQuarter, _secondQuarter, thirdQuarter, _end] =
      quartersOfRange([first, second]);
    return [firstQuarter, thirdQuarter, meta];
  },
});

// Patterns for early-to-mid, mid-to-late, etc., plus singular cases
const EARLY_TO_MID = /early\s+(to|or)\s+mid[-\s]/;
const EARLY_TO_LATE = /early\s+(to|or)\s+late\b/;
const MID_TO_LATE = /mid[-\s](to|or)[-\s]late\b/;
const EARLY_MID = /early[-\s]mid[-\s]/;
const MID_LATE = /mid[-\s]late\b/;
const EARLY = /early/;
const MID = /mid[-\s]/;
const LATE = /\blate\b/;

export const earlyMidLateModifier = (): ModifierConfig<
  string,
  InputHandlerReturn
> => ({
  predicate: (text) =>
    EARLY_TO_MID.test(text) ||
    EARLY_TO_LATE.test(text) ||
    MID_TO_LATE.test(text) ||
    EARLY_MID.test(text) ||
    MID_LATE.test(text) ||
    EARLY.test(text) ||
    MID.test(text) ||
    LATE.test(text),
  extractor: (text: string): string => {
    let extracted = text;

    // Try range patterns first (more specific)
    if (EARLY_TO_MID.test(extracted)) {
      extracted = extracted.replace(EARLY_TO_MID, "").trim();
    } else if (EARLY_TO_LATE.test(extracted)) {
      extracted = extracted.replace(EARLY_TO_LATE, "").trim();
    } else if (MID_TO_LATE.test(extracted)) {
      extracted = extracted.replace(MID_TO_LATE, "").trim();
    } else if (EARLY_MID.test(extracted)) {
      extracted = extracted.replace(EARLY_MID, "").trim();
    } else if (MID_LATE.test(extracted)) {
      extracted = extracted.replace(MID_LATE, "").trim();
    } else if (EARLY.test(extracted)) {
      extracted = extracted.replace(EARLY, "").trim();
    } else if (MID.test(extracted)) {
      extracted = extracted.replace(MID, "").trim();
    } else if (LATE.test(extracted)) {
      extracted = extracted.replace(LATE, "").trim();
    }

    return extracted;
  },
  transformer: ([first, second, meta], text) => {
    const [start, firstThird, secondThird, end] = thirdsOfRange([
      first,
      second,
    ]);

    // Handle range patterns first (more specific)
    if (EARLY_TO_MID.test(text) || EARLY_MID.test(text)) {
      // early to mid: start to end of middle third
      return [start, secondThird, meta];
    } else if (EARLY_TO_LATE.test(text)) {
      // early to late: start to end (full range)
      return [start, end, meta];
    } else if (MID_TO_LATE.test(text) || MID_LATE.test(text)) {
      // mid to late: start of middle third to end
      return [firstThird, end, meta];
    } else if (EARLY.test(text)) {
      // early: first third
      return [start, firstThird, meta];
    } else if (MID.test(text)) {
      // mid: middle third
      return [firstThird, secondThird, meta];
    } else if (LATE.test(text)) {
      // late: last third
      return [secondThird, end, meta];
    }

    // Default fallback
    return [first, second, meta];
  },
});
