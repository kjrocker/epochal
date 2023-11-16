# Epochal

## Description

Designed for ambiguous historical dates going as far back as we can, `epochal` came out of my experiments with plotting fuzzy ancient historical events on timelines dynamically. The basic concept is that while "December 4th, 2020" is a perfectly reasonable single date, "4th millenium" is really an interval that starts January 1st, 4000 BC and ends on December 31st, 3001 BC.

Turns out, natural language historical intervals are complicated. So I took all that work that would otherwise never see the light of day, and I've repackaged it here as a standalone library.

## Installation

```bash
npm install --save epochal

yarn add epochal
```

## Usage

```typescript
import { parseTextToDate } from "epochal";

const { start, end } = parseTextToDate("4th millenium BC");

console.log(start);
// January 1st, 4000 BC

console.log(end);
// December 31st, 3001 BC
```

## API Reference

### parseTextToDate

```typescript
function parseTextToDate(text: string): { start: Date; end: Date };
```

## Tests

```bash
npm test

npm run test:watch
```

## License

This project is licensed under the terms of the MIT license. See the [LICENSE](./LICENSE) file for details.
