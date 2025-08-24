# Year Modifier Refactoring Plan

## Current Architecture Issues

### Problems
1. **Fragmented Year Parsing**: Year parsing logic is duplicated across multiple handlers
   - `handleYear` parses single years with era support
   - `handleYearRangeShorthand` has its own number parsing logic
   - `handleModifierPhrase` strips modifiers and recursively calls `epochizeInner`

2. **Complex Modifier Handling**: Current `handleModifierPhrase` approach is fragile
   - Uses recursive `epochizeInner` calls which can create infinite loops
   - Cannot handle complex patterns like `"ca. 1804–ca. 1835"`
   - Processing order dependencies in the main parser chain

3. **Duplication and Inconsistency**: Year parsing inconsistencies between handlers
   - Century breakpoint logic only in `handleYear`
   - Era support (BC/AD) only in `handleYear` 
   - No standardized way to apply modifiers

## Proposed Architecture

### Core Principle
**Make `handleYear` the authoritative year parser that all other year-based handlers consume.**

### New `handleYear` Responsibilities
1. Parse single years: `"1650"`, `"1650 AD"`, `"50 BC"`
2. Parse years with modifiers: `"ca. 1650"`, `"after 1909"`
3. Return structured metadata about detected modifiers
4. Apply offset logic for modifiers (circa, after)

### Refactored `handleYearRangeShorthand` 
1. Parse range structure: identify start/end components
2. Delegate individual year parsing to `handleYear`
3. Combine results respecting modifier logic

## Implementation Plan

### Phase 1: Enhance `handleYear`

#### 1.1 Add Modifier Detection
```typescript
interface YearParseResult {
  year: number;
  modifier?: 'circa' | 'after';
  originalText: string;
}

const parseYearWithModifier = (text: string, options: EpochizeOptions): YearParseResult | null => {
  // Detect and strip modifiers
  // Parse the year component
  // Return structured result
}
```

#### 1.2 Apply Modifier Logic in handleYear
```typescript
const applyModifierToDateRange = (
  dates: [Date, Date], 
  modifier: 'circa' | 'after' | undefined,
  options: EpochizeOptions
): [Date, Date] => {
  // Apply circa offsets: subtract from start, add to end
  // Apply after offsets: add 1 year to start, add afterOffset to end
}
```

#### 1.3 Update handleYear Interface
- Input: single year strings with optional modifiers
- Output: `[Date, Date]` with modifier effects applied
- Metadata: include detected modifiers

### Phase 2: Refactor `handleYearRangeShorthand`

#### 2.1 New Range Parsing Strategy
```typescript
interface RangeComponents {
  startText: string;      // "ca. 1909" or "1909"
  endText: string;        // "27" or "1927"  
  isShorthand: boolean;   // true for "27", false for "1927"
}

const parseRangeStructure = (input: string): RangeComponents | null => {
  // Parse: "ca. 1909-27", "1650-1700", "ca. 1804–ca. 1835"
  // Return components for individual processing
}
```

#### 2.2 Delegate to handleYear
```typescript
const parseRangeComponents = (components: RangeComponents, options: EpochizeOptions): [Date, Date] | null => {
  // Parse start year using enhanced handleYear
  // Parse/resolve end year (handling shorthand expansion)
  // Apply any end-specific modifiers
  // Combine into final range
}
```

#### 2.3 Handle Complex Patterns
- `"ca. 1909-27"` → `parseYearWithModifier("ca. 1909")` + shorthand "27"
- `"ca. 1804–ca. 1835"` → two separate `parseYearWithModifier` calls
- `"1650-1700"` → standard range, no modifiers

### Phase 3: Update Parser Chain

#### 3.1 Remove handleModifierPhrase from Chain
- Remove from `index.ts` parser chain
- Move "after" handling to `handleYear` if still needed
- Remove `handleModifierPhrase` file entirely

#### 3.2 Update Handler Metadata
- Remove `Handler.MODIFIER_PHRASE`
- Keep `Handler.YEAR` and `Handler.YEAR_RANGE` 
- Add modifier information to metadata

#### 3.3 Test Migration
- Ensure all existing `handleModifierPhrase` tests pass through new `handleYear`
- Verify complex range patterns work
- Test backwards compatibility

## Expected Benefits

### 1. Architectural Consistency
- Single source of truth for year parsing
- Consistent modifier handling across all year-based patterns
- Eliminates recursive parsing issues

### 2. Enhanced Capabilities  
- Support for complex patterns like `"ca. 1804–ca. 1835"`
- Consistent era support across all year patterns
- Better modifier composition

### 3. Maintainability
- Centralized year parsing logic
- Easier to add new modifiers (e.g., "before", "approximately")
- Clearer separation of concerns

### 4. Performance
- Eliminate recursive `epochizeInner` calls
- More efficient parsing for complex patterns
- Reduced code duplication

## Test Coverage Requirements

### Core handleYear Tests
- Single years with modifiers: `"ca. 1650"`, `"after 1909"`
- Era support with modifiers: `"ca. 50 BC"`, `"after 100 AD"`
- Century breakpoint with modifiers
- Invalid modifier patterns

### Range Tests
- Simple shorthand: `"1909-27"`
- Modifier with shorthand: `"ca. 1909-27"`
- Full range with modifiers: `"ca. 1650-1700"`
- Double modifiers: `"ca. 1804–ca. 1835"`
- Mixed patterns: `"after 1900-10"`

### Edge Cases
- Malformed modifier syntax
- Conflicting modifiers
- Invalid year ranges with modifiers
- Boundary conditions (year 0, negative years)

## Migration Path

1. **Backwards Compatibility**: Ensure all existing tests continue to pass
2. **Gradual Rollout**: Implement new `handleYear` first, test thoroughly
3. **Handler Chain Update**: Update `handleYearRangeShorthand` to use new `handleYear`
4. **Cleanup**: Remove `handleModifierPhrase` and update parser chain
5. **Documentation**: Update README with new modifier support patterns

## Success Criteria

- All existing metropolitan museum test cases pass
- New complex modifier patterns work correctly  
- No performance regression in parsing
- Cleaner, more maintainable codebase
- Enhanced test coverage for modifier edge cases