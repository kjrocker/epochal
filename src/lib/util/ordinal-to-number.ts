const ordinalMap = {
  first: "1st",
  second: "2nd",
  third: "3rd",
  fourth: "4th",
  fifth: "5th",
  sixth: "6th",
  seventh: "7th",
  eighth: "8th",
  ninth: "9th",
  tenth: "10th",
  eleventh: "11th",
  twelfth: "12th",
  thirteenth: "13th",
};
const ordinalWords =
  /(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth)/g;
export const ordinalToNumber = (input: string): string => {
  return input.replace(
    ordinalWords,
    (match) => ordinalMap[match as keyof typeof ordinalMap]
  );
};
