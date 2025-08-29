# Problem Statement

Handling date "ranges" is a bit of a mess. We have good support for them when they can be divided by a simple deliminter and processed independently, but that's actually quite rare in the data.

We can handle "4th millenium BC to 3rd millenium BC", but instead we get "4th to 3rd millenium BC".

This is currently a snarl of conditionals and recursive calls in /src/lib/range.ts

Here is a short list of some of the syntaxes we'll need to support.

1. ca. 3800–3600 BCE
2. 1940s–70s
3. January 8–April 13, 1964
4. 450–425 BCE
5. late 4th–2nd century B.C.

# Vague Solution

We have encountered hard problems like this twice before. First dealing with endless null handling, we introduced the `Maybe` monad that let us chain function calls together.

Second, when dealing with "modifier" strings such as "early", "late", "circa", we introduced the `Modifier` pattern which broke the problem down into smaller, composable pieces.

Ideally our range solution would be similiar. I do notice there's a sense of "context" that happens on both sides of the delimiter. But sometimes that context is "a year" that operates on both months, sometimes that "context" is "BCE" which operates on both millenia.

# Potential Directions

## Direction 1: Context Extraction Pattern

Similar to how modifiers are extracted and applied, we could create a `RangeContext` pattern that:

1. **Identifies shared context** - Extract suffixes/prefixes that apply to both sides (e.g., "BCE", "century", "1964")
2. **Normalizes the range** - Convert "4th to 3rd millenium BC" into "4th millenium to 3rd millenium" + context "BC"
3. **Applies context** - Parse each side independently, then apply the extracted context to both results

This would involve:
- Context detection patterns (regex-based or rule-based)
- A context application system that knows how to apply "BCE" to years vs "century" to ordinals
- Fallback to existing independent parsing when no shared context is detected

## Direction 2: Range Grammar Parser

Instead of trying to split and normalize, treat ranges as a distinct grammatical construct with explicit rules:

1. **Range-specific parsers** - Create parsers that understand range syntax natively
2. **Context inheritance rules** - Define how context flows from right-to-left or encompasses both sides
3. **Compositional parsing** - Build up complex ranges from simpler components

This would involve:
- `parseYearRange()`, `parseCenturyRange()`, `parseDecadeRange()` functions
- Context inheritance rules (e.g., "late 4th–2nd century" = "late 4th century to 2nd century")
- A range-specific Maybe chain that can handle partial successes on either side

# Direction 2 Implementation Outline

## New `handleRange` Structure

Instead of the current approach that tries to split and parse independently, the new grammar-based approach would:

```typescript
export const handleRange: InputHandler = (input, options) => {
  return input
    .tryMany<[Date, Date, HandlerMetadata]>(
      // Try specialized range parsers in priority order
      (text) => handleYearRange(Maybe.fromValue(text), options),
      (text) => handleDecadeRange(Maybe.fromValue(text), options), 
      (text) => handleCenturyRange(Maybe.fromValue(text), options),
      (text) => handleMillenniumRange(Maybe.fromValue(text), options),
      (text) => handleMonthRange(Maybe.fromValue(text), options),
      // Fallback to current split-and-parse approach
      (text) => handleGenericRange(Maybe.fromValue(text), options)
    )
    .map(attachMetadata(Handler.RANGE));
};
```

## Range Grammar Parser Pseudocode

### Self-Contained Range Functions

Each range handler delegates to specific, self-contained functions that handle their own pattern matching and context:

```typescript
const handleYearRange: InputHandler = (input, options) => {
  return input
    .tryMany<[Date, Date, HandlerMetadata]>(
      (text) => handleYearRangeWithEra(text, options),
      (text) => handleYearRangeShorthand(text, options),
      (text) => handleYearRangeSimple(text, options)
    );
};
```

### Example: Self-Contained Year Range Functions

```typescript
// Handles "ca. 3800–3600 BCE"
const handleYearRangeWithEra = (
  text: string, 
  options: EpochizeOptions
): [Date, Date, HandlerMetadata] | null => {
  const match = text.match(/^(ca\.?\s*)?(\d+)\s*[-–—]\s*(\d+)\s+(BCE?|CE?|AD)$/i);
  if (!match) return null;

  const [, circaPrefix, startYear, endYear, era] = match;
  
  // Construct full year strings with shared context
  const startText = [circaPrefix?.trim(), startYear, era].filter(Boolean).join(' ');
  const endText = [circaPrefix?.trim(), endYear, era].filter(Boolean).join(' ');

  // Delegate to existing handleYear handler
  const startResult = handleYear(Maybe.fromValue(startText), options).get();
  const endResult = handleYear(Maybe.fromValue(endText), options).get();

  if (!startResult || !endResult) return null;
  
  return [startResult[0], endResult[1], { handler: Handler.YEAR_RANGE }];
};

// Handles "1970-1980" 
const handleYearRangeSimple = (
  text: string, 
  options: EpochizeOptions
): [Date, Date, HandlerMetadata] | null => {
  const match = text.match(/^(\d{4})\s*[-–—]\s*(\d{4})$/);
  if (!match) return null;

  const [, startYear, endYear] = match;
  
  // Delegate to existing handleYear handler
  const startResult = handleYear(Maybe.fromValue(startYear), options).get();
  const endResult = handleYear(Maybe.fromValue(endYear), options).get();

  if (!startResult || !endResult) return null;
  
  return [startResult[0], endResult[1], { handler: Handler.YEAR_RANGE }];
};

// Handles "1940s–70s" with left inheritance
const handleYearRangeShorthand = (
  text: string, 
  options: EpochizeOptions
): [Date, Date, HandlerMetadata] | null => {
  const match = text.match(/^(\d{4})s\s*[-–—]\s*(\d{2})s$/);
  if (!match) return null;

  const [, startDecade, endShorthand] = match;
  
  // Expand shorthand: "70s" becomes "1970s" using left context
  const century = startDecade.substring(0, 2);
  const expandedEnd = century + endShorthand + 's';
  
  // Delegate to existing handleDecade handler
  const startResult = handleDecade(Maybe.fromValue(startDecade + 's'), options).get();
  const endResult = handleDecade(Maybe.fromValue(expandedEnd), options).get();

  if (!startResult || !endResult) return null;
  
  return [startResult[0], endResult[1], { handler: Handler.DECADE_RANGE }];
};
```

### Additional Self-Contained Range Functions

```typescript
// Handles "late 4th–2nd century B.C." 
const handleCenturyRangeWithEra = (
  text: string,
  options: EpochizeOptions
): [Date, Date, HandlerMetadata] | null => {
  const match = text.match(/^(?<startModifier>(?:early|mid|late)\s+)?(?<startNumber>\d+(?:st|nd|rd|th))\s*[-–—]\s*(?<endModifier>(?:early|mid|late)\s+)?(?<endNumber>\d+(?:st|nd|rd|th))\s+century(?<era>\s+(?:bc|b\.c\.|ad|a\.d\.))?$/i);
  if (!match?.groups) return null;

  const { startModifier, startNumber, endModifier, endNumber, era } = match.groups;
  
  // Construct full century strings with shared era
  const startText = [startModifier?.trim(), startNumber, "century", era?.trim()]
    .filter(Boolean).join(' ');
  const endText = [endModifier?.trim(), endNumber, "century", era?.trim()]
    .filter(Boolean).join(' ');

  // Delegate to existing handleCentury handler
  const startResult = handleCentury(Maybe.fromValue(startText), options).get();
  const endResult = handleCentury(Maybe.fromValue(endText), options).get();

  if (!startResult || !endResult) return null;
  
  return [startResult[0], endResult[1], { handler: Handler.CENTURY_RANGE }];
};

// Handles "January 8–April 13, 1964"
const handleMonthDayRangeWithYear = (
  text: string,
  options: EpochizeOptions  
): [Date, Date, HandlerMetadata] | null => {
  const match = text.match(/^(\w+)\s+(\d+)\s*[-–—]\s*(\w+)\s+(\d+),\s*(\d{4})$/);
  if (!match) return null;

  const [, startMonth, startDay, endMonth, endDay, year] = match;
  
  // Construct full date strings with shared year context
  const startText = `${startMonth} ${startDay}, ${year}`;
  const endText = `${endMonth} ${endDay}, ${year}`;

  // Delegate to existing handleDay handler
  const startResult = handleDay(Maybe.fromValue(startText), options).get();
  const endResult = handleDay(Maybe.fromValue(endText), options).get();

  if (!startResult || !endResult) return null;
  
  return [startResult[0], endResult[1], { handler: Handler.DAY_RANGE }];
};
```

### Benefits of Handler Delegation

1. **Consistency** - Ensures range parsing uses identical logic to non-range parsing
2. **Maintainability** - Changes to individual handlers automatically apply to ranges  
3. **Modifier Support** - Inherits full modifier system (early/late/circa) without reimplementation
4. **Testing** - Range builders are tested implicitly through existing handler tests
5. **Code Reuse** - Avoids duplicating complex parsing logic like BCE/CE handling