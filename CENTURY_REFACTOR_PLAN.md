# Century/Millennium Convention Refactor Plan

## Overview

This refactor introduces support for both "popular" and "formal" century/millennium conventions, with the popular convention as the new default.

### Conventions Explained

- **Popular Convention** (new default): 
  - 20th century = 1900-1999
  - 2nd millennium = 1000-1999
  - Matches common usage and public expectation

- **Formal Convention** (current behavior):
  - 20th century = 1901-2000  
  - 2nd millennium = 1001-2000
  - Follows academic/ISO standards

## Current Implementation Analysis

### Key Files
- `src/lib/util/options.ts` - Options interface and defaults
- `src/lib/date-fns/util.ts` - Core date calculation functions
- `src/lib/century.ts` - Century parsing handler
- `src/lib/millenium.ts` - Millennium parsing handler

### Current Date Calculation Logic
```typescript
// Century (formal convention)
startOfCentury: Math.floor(year / 100) * 100 + 1  // +1 for formal
endOfCentury: Math.floor(year / 100) * 100 + 100

// Millennium (formal convention)  
startOfMillenium: Math.floor(year / 1000) * 1000 + 1  // +1 for formal
endOfMillenium: Math.floor(year / 1000) * 1000 + 1000
```

### Test Impact
Current tests in `src/lib/index.spec.ts` and `src/lib/date-fns/index.spec.ts` expect formal convention:
- "2nd millennium" → 1001-2000 (current)
- "3rd millennium" → 2001-3000 (current)

**Note**: There's a skipped test (`xit`) showing awareness that "2000 should be part of the 2nd millennium" - exactly what popular convention provides.

## Implementation Plan

### Phase 1: API Design Changes

#### 1.1 Update Options Interface
**File**: `src/lib/util/options.ts`
```typescript
export interface EpochizeOptions {
  centuryShorthand: boolean;
  centuryBreakpoint: number;
  centuryConvention: 'popular' | 'formal';  // NEW
  circaStartOffset: number;
  circaEndOffset: number;
  afterOffset: number;
}

export const DEFAULT_OPTIONS: EpochizeOptions = {
  centuryShorthand: false,
  centuryBreakpoint: 29,
  centuryConvention: 'popular',  // NEW DEFAULT
  circaStartOffset: 3,
  circaEndOffset: 0,
  afterOffset: 10,
};
```

#### 1.2 Update Date-fns Function Signatures
**File**: `src/lib/date-fns/util.ts`
```typescript
// Add options parameter to core functions
export function startOfCentury(
  dirtyDate: Date | number, 
  options?: { centuryConvention?: 'popular' | 'formal' }
): Date;

export function endOfCentury(
  dirtyDate: Date | number,
  options?: { centuryConvention?: 'popular' | 'formal' }  
): Date;

export function startOfMillenium(
  dirtyDate: Date | number,
  options?: { centuryConvention?: 'popular' | 'formal' }
): Date;

export function endOfMillenium(
  dirtyDate: Date | number,
  options?: { centuryConvention?: 'popular' | 'formal' }
): Date;
```

### Phase 2: Core Logic Implementation

#### 2.1 Updated Date Calculation Logic
```typescript
// Popular Convention (new default)
startOfCentury: Math.floor(year / 100) * 100      // no +1
endOfCentury: Math.floor(year / 100) * 100 + 99   // +99 instead of +100

startOfMillenium: Math.floor(year / 1000) * 1000  // no +1  
endOfMillenium: Math.floor(year / 1000) * 1000 + 999  // +999 instead of +1000

// Formal Convention (backward compatibility)
startOfCentury: Math.floor(year / 100) * 100 + 1  // current behavior
endOfCentury: Math.floor(year / 100) * 100 + 100  // current behavior

startOfMillenium: Math.floor(year / 1000) * 1000 + 1    // current behavior
endOfMillenium: Math.floor(year / 1000) * 1000 + 1000   // current behavior
```

#### 2.2 Handler Updates
**Files**: `src/lib/century.ts`, `src/lib/millenium.ts`
- Pass `options` parameter to date-fns functions
- Ensure options flow through the modifier chain

### Phase 3: Testing Strategy

#### 3.1 Test Coverage Requirements
- [ ] Popular convention test cases (new default behavior)
- [ ] Formal convention test cases (backward compatibility)
- [ ] Edge cases (year 0, negative years, boundary years)
- [ ] Modifier interactions (quarters, halves, thirds with both conventions)
- [ ] Options passing through the entire chain

#### 3.2 Test Refactoring Strategy
**Preserve existing tests** by passing formal convention option rather than rewriting:

```typescript
// Update existing test calls to use formal convention
const formalOptions = { centuryConvention: 'formal' as const };

// Before
const result = epochize('2nd millennium');

// After  
const result = epochize('2nd millennium', formalOptions);
```

This approach:
- ✅ Minimizes test changes and potential regressions
- ✅ Preserves existing test logic and expectations  
- ✅ Maintains test coverage for formal convention
- ✅ Reduces implementation risk

#### 3.3 New Popular Convention Tests
Add **new** test suites for popular convention (default behavior):
```typescript
describe('Popular Convention (Default)', () => {
  it('should use popular century boundaries by default', () => {
    const result = epochize('20th century');
    expect(result[0]).toEqual(new Date('1900-01-01T00:00:00.000Z'));
    expect(result[1]).toEqual(new Date('1999-12-31T23:59:59.999Z'));
  });
  
  it('should use popular millennium boundaries by default', () => {
    const result = epochize('2nd millennium');
    expect(result[0]).toEqual(new Date('1000-01-01T00:00:00.000Z'));
    expect(result[1]).toEqual(new Date('1999-12-31T23:59:59.999Z'));
  });
});

describe('Formal Convention (Explicit)', () => {
  const formalOptions = { centuryConvention: 'formal' as const };
  
  it('should use formal convention when specified', () => {
    const result = epochize('20th century', formalOptions);
    expect(result[0]).toEqual(new Date('1901-01-01T00:00:00.000Z'));
    expect(result[1]).toEqual(new Date('2000-12-31T23:59:59.999Z'));
  });
});
```

### Phase 4: Implementation Steps

#### 4.1 Core Infrastructure
1. [ ] Update `EpochizeOptions` interface
2. [ ] Update `DEFAULT_OPTIONS` to use popular convention
3. [ ] Modify date-fns utility functions to accept options
4. [ ] Implement convention-aware calculation logic

#### 4.2 Handler Integration  
5. [ ] Update century handler to pass options to date-fns
6. [ ] Update millennium handler to pass options to date-fns
7. [ ] Ensure options flow through modifier chains

#### 4.3 Testing & Validation
8. [ ] Add new popular convention test suites (default behavior)
9. [ ] Update existing tests to use formal convention option (preserve current logic)
10. [ ] Validate that quarter/half/third modifiers work with both conventions
11. [ ] Test edge cases and boundary conditions

#### 4.4 Documentation
12. [ ] Update API documentation
13. [ ] Add migration guide for users relying on formal convention
14. [ ] Update examples to reflect popular convention default

## Breaking Changes

⚠️ **This is a breaking change** - the default behavior for century/millennium parsing will change:

### Before (Formal Convention Default)
```javascript
epochize('20th century')  // [1901-01-01, 2000-12-31]
epochize('2nd millennium') // [1001-01-01, 2000-12-31]
```

### After (Popular Convention Default)  
```javascript
epochize('20th century')  // [1900-01-01, 1999-12-31]
epochize('2nd millennium') // [1000-01-01, 1999-12-31]

// Formal convention still available via options
epochize('20th century', { centuryConvention: 'formal' })  // [1901-01-01, 2000-12-31]
```

## Migration Path

For users who need the old behavior:
```javascript
// Option 1: Pass formal convention in each call
const result = epochize('20th century', { centuryConvention: 'formal' });

// Option 2: Create a configured epochize function
import { createEpochize } from 'epochal';
const formalEpochize = createEpochize({ centuryConvention: 'formal' });
const result = formalEpochize('20th century');
```

## Validation Checklist

Before implementation completion:
- [ ] All existing tests pass unchanged after adding formal convention option
- [ ] New popular convention tests pass by default  
- [ ] Quarter/half/third modifiers work correctly with both conventions
- [ ] Options parameter flows through entire parsing chain
- [ ] Edge cases handled (year 0, negative years, boundary conditions)
- [ ] Performance impact assessed and acceptable
- [ ] Documentation updated with examples and migration guide

## Timeline Estimate

- **Phase 1 (API Design)**: 1 day
- **Phase 2 (Core Logic)**: 2 days  
- **Phase 3 (Testing)**: 2 days
- **Phase 4 (Integration & Polish)**: 1 day

**Total**: ~6 days