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

## License

This project is licensed under the terms of the MIT license. See the [LICENSE](./LICENSE) file for details.
