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

export const firstThirdModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /(?<=early).*/.test(text),
  extractor: (text) => text.replace(/(?<=early).*/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [start, middle] = thirdsOfRange(dates);
    return [start, middle];
  },
});

export const secondThirdModifier = (): ModifierConfig<
  string,
  [Date, Date]
> => ({
  predicate: (text) => /(?<=mid).*/.test(text),
  extractor: (text) => text.replace(/(?<=mid).*/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [start, middle, secondMiddle] = thirdsOfRange(dates);
    return [middle, secondMiddle];
  },
});

export const thirdThirdModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /(?<=late).*/.test(text),
  extractor: (text) => text.replace(/(?<=late).*/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [start, middle, secondMiddle, end] = thirdsOfRange(dates);
    return [secondMiddle, end];
  },
});

export const firstHalfModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /first half of (?:the )?(.*)/.test(text),
  extractor: (text) => text.replace(/first half of (?:the )?(.*)/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [start, middle, _end] = halvesOfRange(dates);
    return [start, middle];
  },
});

export const secondHalfModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => /second half of (?:the )?(.*)/.test(text),
  extractor: (text) => text.replace(/second half of (?:the )?(.*)/, "").trim(),
  transformer: (dates: [Date, Date]): [Date, Date] => {
    const [_start, middle, end] = halvesOfRange(dates);
    return [middle, end];
  },
});
