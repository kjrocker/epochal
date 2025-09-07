# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build**: `npm run build` - Compiles TypeScript to JavaScript in the `build/` directory
- **Test**: `npm test` - Runs Jest test suite
- **Test Watch**: `npm run test:watch` - Runs tests in watch mode for development
- **Lint**: `npm run lint` - Runs ESLint on the `src/` directory
- **Process Metropolitan Dataset**: `npm run process:metropolitan` - Runs ts-node to process metropolitan museum dataset

## Important API Usage Notes

**ALWAYS use `epochize()`, NEVER use `epochizeInner()`** - `epochize` is the public API that returns `[Date, Date] | null`. `epochizeInner` is internal and returns a Maybe monad with metadata that should not be used by external scripts or consumers.

## Architecture Overview

This is a TypeScript library for parsing ambiguous historical dates into precise date ranges. The main entry point is the `epochize` function which converts natural language date strings (like "4th millennium BC", "early 17th century") into `[Date, Date]` tuples representing start and end dates.

### Core Architecture

- **Main API**: `src/index.ts` exports the primary `epochize` function
- **Core Logic**: `src/lib/index.ts` contains `epochizeInner` which uses a cascading parser approach
- **Parser Chain**: Handles different date formats through specialized parsers (tried in sequence):
  - `handleRange` - Date ranges (e.g., "1990-2000")
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
- **Modifier System**: `src/lib/modifiers/` - Handles temporal modifiers like "early", "mid", "late"
- **Metadata Support**: Each parse result includes metadata with alternatives and original input
- **Metropolitan Dataset Processing**: `src/lib/metropolitian/` - Specialized tooling for processing museum date data

### Dependencies

- **date-fns**: Primary date manipulation library for date calculations
- **Jest**: Testing framework with ts-jest preset and Node environment
- **TypeScript**: Compiled to CommonJS targeting ES2018
- **ESLint**: Modern flat config with TypeScript support, unused vars disabled
- **fast-check**: Property-based testing library for generating test cases

### Test Structure

Tests use `.spec.ts` extension and are co-located with source files. Key test files:
- `src/lib/index.spec.ts` - Main functionality tests
- `src/lib/consistency.spec.ts` - Consistency validation across different date formats
- `src/lib/properties.spec.ts` - Property-based tests using fast-check
- `src/lib/metadata.spec.ts` - Metadata handling tests
- Individual parser tests (e.g., `year.spec.ts`, `range.spec.ts`)
- `src/lib/metropolitian/metropolitian.spec.ts` - Metropolitan dataset processing tests

### Build Configuration

- **Output Directory**: `build/` - Contains compiled JavaScript and declarations
- **TypeScript Config**: Strict mode with ES2018 target, CommonJS modules
- **Source Maps**: Inline source maps for debugging
- **Declarations**: Generated `.d.ts` files with declaration maps
- **Test Exclusion**: `.spec.ts` and `.test.ts` files excluded from build
- **Jest Setup**: Global setup file at `jest.setup.js`