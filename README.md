# Epochal

## Description

Designed for handling ambiguous historical dates, `epochal` is a library born out of my experiments with dynamically plotting fuzzy ancient historical events on timelines. The fundamental idea behind this library is that while "December 4th, 2020" represents a specific date, "4th millennium" actually denotes an interval that starts on January 1st, 4000 BC, and ends on December 31st, 3001 BC.

Working with natural language historical intervals can be quite complex. With `epochal` I've taken all the work I've done in this area and packaged it into a standalone library that anyone can use.

## Installation

You can install `epochal` via npm or yarn:

```bash
npm install --save epochal

# or

yarn add epochal

```

## Usage

Here's how you can use `epochal` in your TypeScript projects:

```typescript
import { epochize } from "epochal";

const [start, end] = epochize("4th millenium BC");

console.log(start);
// January 1st, 4000 BC

console.log(end);
// December 31st, 3001 BC
```

Some other examples of dates that work
```
12th century BC
early 17th century
1999
June 2020
July 18th, 2027
late July 1920
mid 1888
```

## API Reference

### `epochize`

The `epochize` function allows you to convert ambiguous historical date text into a precise date range.

```typescript
function epochize(text: string): [Date, Date];
```

## Tests

You can run tests for `epochal` using the following commands:

```bash
npm test

npm run test:watch
```

## Clever Bits

The interesting code.

### The 'Maybe' Monad

Monads have a bad reputation. Basically every function in this library needs to abort if it runs into something it doesn't understand, he default behavior is to give up and hope another function can handle it.

I took a basic `Maybe` class off the internet, and extended it with some additional features like `tryEach` and `tryMany`. This flow of "creating a Maybe, and chaining functions on it" is the backbone of Epochal.

### The 'Modifier'....thingy.

I don't have a term for this. I'm sure there's a proper FP term, but I don't know it.

I repeatedly ran into exceptions/code that looked like this:
1. If a certain condition is true (such as 'contains "early"')
2. Transform an input (remove the "early")
3. Then at a later stage, adjust the result (adjust the date range to be only the first half of its original value)

I distilled this pattern down to a `Modifier` object with a predicate, an extractor, and a transformer.

```typescript
Modifier.fromValue(text)
  .withModifier(seasonModifier())
  .withModifier(circaModifier(options))
  .withModifier(earlyMidLateModifier())
  .flatMap((text) => yearToNumber(text, options))
  .map((num) => yearToDate(num))
  .map((year): [Date, Date] => [startOfYear(year), endOfYear(year)])
  .unwrap()
```

We can see a few modifiers here. `seasonModifier` detects "spring/summer/fall/winter", and restricts the returned year to the correct months. The `earlyMidLateModifier` is common across years, centuries, and millenia, and handles "early XXXX" syntax, adjusting it to be the first third of the range (or the first half, depending on settings).

The `circaModifier` detects `ca./circa` and adjusts the start/end date based on `circaStartOffset` and `circaEndOffset`.

Finally, going into `flatMap` and `map` processes the actual string, and `unwrap` chains the modifiers at the very end, resolving the pipeline. I managed to massage the types so that you can't call `unwrap` until the return type actually matches what the modifiers expect.

## License

This project is licensed under the terms of the MIT license. See the [LICENSE](./LICENSE) file for details.
