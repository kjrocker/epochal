# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build**: `npm run build` - Compiles TypeScript to JavaScript in the `build/` directory
- **Test**: `npm test` - Runs Jest test suite
- **Test Watch**: `npm run test:watch` - Runs tests in watch mode for development
- **Lint**: `npm run lint` - Runs ESLint on the `src/` directory

## Architecture Overview

This is a TypeScript library for parsing ambiguous historical dates into precise date ranges. The main entry point is the `epochize` function which converts natural language date strings (like "4th millennium BC", "early 17th century") into `[Date, Date]` tuples representing start and end dates.

### Core Architecture

- **Main API**: `src/index.ts` exports the primary `epochize` function
- **Core Logic**: `src/lib/index.ts` contains `epochizeInner` which uses a cascading parser approach
- **Parser Chain**: Handles different date formats through specialized parsers:
  - `handleRange` - Date ranges (e.g., "1990-2000")
  - `handlePartial` - Partial dates with qualifiers (e.g., "early 1990s")
  - `handleMonth` - Month-based dates
  - `handleDay` - Day-specific dates
  - `handleYear` - Year-based dates
  - `handleDecade` - Decade parsing
  - `handleCentury` - Century parsing
  - `handleMillenium` - Millennium parsing

### Key Components

- **Maybe Monad**: `src/lib/util/maybe.ts` - Handles nullable values and chaining operations
- **Options System**: `src/lib/util/options.ts` - Configuration including `centuryShorthand` and `centuryBreakpoint`
- **Date-fns Integration**: `src/lib/date-fns/` - Custom date manipulation utilities

### Dependencies

- **date-fns**: Primary date manipulation library
- **Jest**: Testing framework with ts-jest preset
- **TypeScript**: Compiled to CommonJS targeting ES2018
- **ESLint**: Configured with TypeScript support, unused vars disabled

### Test Structure

Tests use `.spec.ts` extension and are co-located with source files. Key test files:
- `src/lib/index.spec.ts` - Main functionality tests
- `src/lib/consistency.spec.ts` - Consistency validation
- `src/lib/properties.spec.ts` - Property-based tests
- Uses `fast-check` for property-based testing

### Build Configuration

- Output directory: `build/`
- Generates declaration files and source maps
- Excludes test files from compilation
- Uses strict TypeScript configuration