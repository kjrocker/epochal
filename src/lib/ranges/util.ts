export const matchTo = (input: string): [string, string] | null => {
  // Use regex with word boundaries to match "to" and "or" as whole words
  const toRegex = /\b(to|or|and)\b/g;
  const matches = input.split(toRegex);

  // Filter out the separator from the matches array
  const parts = matches.filter(
    (part, index) => index % 2 === 0 && part.trim() !== ""
  );

  if (parts.length === 2) {
    return [parts[0].trim(), parts[1].trim()];
  }

  return null;
};

export const matchDash = (input: string): [string, string] | null => {
  // Match hyphen, en-dash, or em-dash, with optional question marks
  const matches = input.split(/\??\s*[-–—‒]\s*\??/);
  if (matches.length !== 2) return null;
  return [matches[0].trim(), matches[1].trim()];
};

export const matchSlash = (input: string): [string, string] | null => {
  // Match hyphen, en-dash, or em-dash
  const matches = input.split(/[/]/);
  if (matches.length !== 2) return null;
  return matches as [string, string];
};
