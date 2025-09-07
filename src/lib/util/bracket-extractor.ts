/**
 * Extracts content from square brackets in date strings.
 * Handles patterns like "n.d. [ca. 1770]" -> "ca. 1770"
 */
const BRACKET_MATCH = /\[([^\]]*)\]/;
export const extractFromBrackets = (input: string): string | null => {
  // Match content inside square brackets (including empty brackets)
  const bracketMatch = input.match(BRACKET_MATCH);
  if (!bracketMatch) {
    return null;
  }
  return bracketMatch[1].trim();
};

export const handleBrackets = (input: string): string => {
  const extracted = extractFromBrackets(input);
  return extracted ? extracted : input;
};
