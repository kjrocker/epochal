// Month regex that handles common misspellings and variations
const EN_MONTHS =
  /(?<month>jan(?:uary)?|feb(?:ruary|uary|urary|ruary|ruruary|rurary|urar|rar)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?|tember|temeber)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\.|,)?/;

// Function to get the month regex
export function getMonthRegex(): RegExp {
  return EN_MONTHS;
}

// Function to get just the source pattern for embedding in other regexes
export function getMonthPattern(): string {
  return EN_MONTHS.source;
}

const EN_ERA = /\b(bc|bce|ad|ce|b\s*\.?\s*c\.?|b\s*\.?\s*c\s*\.?\s*e\.?|a\s*\.?\s*d\.?|c\s*\.?\s*e\.?)\b/;

export function getEraRegex(): RegExp {
  return EN_ERA;
}

export function getEraPattern(): string {
  return EN_ERA.source;
}
