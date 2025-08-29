import { handleCentury } from "../century";
import { Maybe } from "../util/maybe";
import { InputHandler } from "../util/util";

export const matchCenturyRange = (input: string): [string, string] | null => {
  // First try: Match patterns with shared era at the end like "3rd–2nd century bc"
  const sharedEraMatch = input.match(
    /^(?<startModifier>(?:early|mid|late)\s+)?(?<startNumber>\d+(?:st|nd|rd|th))\s*[-–—]\s*(?<endModifier>(?:early|mid|late)\s+)?(?<endNumber>\d+(?:st|nd|rd|th))\s+century(?<era>\s+(?:bc|ad))?$/i
  );

  if (sharedEraMatch?.groups) {
    const { startModifier, startNumber, endModifier, endNumber, era } =
      sharedEraMatch.groups;

    // Construct the full century strings
    const startParts = [
      startModifier?.trim(),
      startNumber,
      "century",
      era?.trim(),
    ].filter(Boolean);

    const endParts = [
      endModifier?.trim(),
      endNumber,
      "century",
      era?.trim(),
    ].filter(Boolean);

    return [startParts.join(" "), endParts.join(" ")];
  }

  // Second try: Match patterns with individual eras like "1st century bc–1st century ad"
  const mixedEraMatch = input.match(
    /^(?<startModifier>(?:early|mid|late)\s+)?(?<startNumber>\d+(?:st|nd|rd|th))\s+century(?<startEra>\s+(?:bc|ad))?\s*[-–—]\s*(?<endModifier>(?:early|mid|late)\s+)?(?<endNumber>\d+(?:st|nd|rd|th))\s+century(?<endEra>\s+(?:bc|ad))?$/i
  );

  if (mixedEraMatch?.groups) {
    const {
      startModifier,
      startNumber,
      startEra,
      endModifier,
      endNumber,
      endEra,
    } = mixedEraMatch.groups;

    // Construct the full century strings
    const startParts = [
      startModifier?.trim(),
      startNumber,
      "century",
      startEra?.trim(),
    ].filter(Boolean);

    const endParts = [
      endModifier?.trim(),
      endNumber,
      "century",
      endEra?.trim(),
    ].filter(Boolean);

    return [startParts.join(" "), endParts.join(" ")];
  }

  return null;
};

export const handleCenturyRange: InputHandler = (input, options) => {
  return input
    .tryEach((text) => matchCenturyRange(text))
    .map(([start, end]) => {
      const startRange = handleCentury(Maybe.fromValue(start), options).get();
      const endRange = handleCentury(Maybe.fromValue(end), options).get();
      if (!startRange || !endRange) return null;
      return [startRange[0], endRange[1], startRange[2]];
    });
};
