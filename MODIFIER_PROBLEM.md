# The Modifier Problem

This document is a problem statement articulating one of the weaker patterns in the codebase, and brainstorming how we can address it.

## The Problem

Modifiers such as "circa", "after", "early", "first half of", etc. end up creating a lot of special logic that is applied outside the normal handler chain. Most of these are actually handler dependent as well (early behaves differently for centuries than for years, circa should not apply to months).

This logic ends up being very imperative/procedural, and it's a huge mess.

## One Possible Solution

We _could_ create a class that would go inside of, or wrap around, the `Maybe` container we're already using. This would contain the transformation.

For example, the millenium logic would be extended from the current chain of basic, "un-modified" handlers:

```ts
export const handleMillenium: InputHandler = (input: string) => {
  return Maybe.fromValue(input)
    .map(milleniumToOrdinal)
    .map(milleniumToDate)
    .map((date): [Date, Date] => [startOfMillenium(date), endOfMillenium(date)])
    .map(attachMetadata(Handler.MILLENNIUM));
};
```

To something using the concrete Modifier pattern with an identity modifier:

```ts
export const handleMillenium: InputHandler = (input, options) => {
  return input
    .flatMap(text => 
      Modifier.fromValue(text)
        .withModifier(
          () => true, // identity modifier - always applies
          (text: string) => text, // identity extractor - no change
          (dates: [Date, Date]) => dates // identity transformer - no change
        )
        .map(milleniumToOrdinal)
        .map(milleniumToDate)
        .map((date): [Date, Date] => [startOfMillenium(date), endOfMillenium(date)])
        .unwrap()
    )
    .map(attachMetadata(Handler.MILLENNIUM));
};
```

Or more realistically, with actual modifier support:

```ts
export const handleMillenium: InputHandler = (input, options) => {
  return input
    .flatMap(text => 
      Modifier.fromValue(text)
        .withModifier(
          (text: string) => /ca\.|c\.|circa/.test(text),
          (text: string) => text.replace(/ca\.|c\.|circa/, "").trim(),
          (dates: [Date, Date]) => [
            startOfMillenium(sub(dates[0], { years: options.circaStartOffset * 100 })),
            endOfMillenium(add(dates[1], { years: options.circaEndOffset * 100 }))
          ]
        )
        .map(milleniumToOrdinal)
        .map(milleniumToDate)
        .map((date): [Date, Date] => [startOfMillenium(date), endOfMillenium(date)])
        .unwrap()
    )
    .map(attachMetadata(Handler.MILLENNIUM));
};
```

The responsibilities of the 'Modifier' class would include:
1. Taking a filter function that checks 'does this modifier apply'
2. A map (and flatMap) function that passes along the value _without_ the modifier
    - An implicit requirement is some kind of 'removal' function
3. An unwrap function that applies the stored "final" transformation once other operations have occurred
4. It should continue to support the `Maybe` behavior where a null value causes the entire chain to fall apart.

## Concrete Solution

Here's a proposed implementation that would clean up the modifier handling:

```ts
interface ModifierRule<T, R> {
  predicate: (input: T) => boolean;
  extractor: (input: T) => T; // removes the modifier from input
  transformer: (result: R, originalInput: T) => R; // applies the modifier to final result
}

// Split the class into two phases: building and ready-to-unwrap
class ModifierBuilder<T> {
  private rules: ModifierRule<T, any>[] = [];
  private maybe: Maybe<T>;
  private originalInput: T;

  constructor(input: T) {
    this.maybe = Maybe.fromValue(input);
    this.originalInput = input;
  }

  static fromValue<T>(input: T): ModifierBuilder<T> {
    return new ModifierBuilder(input);
  }

  withModifier<R>(
    predicate: (input: T) => boolean,
    extractor: (input: T) => T,
    transformer: (result: R, originalInput: T) => R
  ): ModifierWithRules<T, R> {
    const newRules = [...this.rules, { predicate, extractor, transformer }];
    
    // Apply all extractors to get clean input
    let cleanInput = this.originalInput;
    for (const rule of newRules) {
      if (rule.predicate(cleanInput)) {
        cleanInput = rule.extractor(cleanInput);
      }
    }
    
    return new ModifierWithRules<T, R>(
      this.originalInput,
      newRules,
      Maybe.fromValue(cleanInput)
    );
  }

  map<NewR>(fn: (value: T) => NewR): ModifierBuilder<NewR> {
    const newBuilder = new ModifierBuilder<NewR>(this.originalInput as any);
    newBuilder.rules = this.rules;
    newBuilder.maybe = this.maybe.map(fn) as any;
    return newBuilder;
  }

  flatMap<NewR>(fn: (value: T) => Maybe<NewR>): ModifierBuilder<NewR> {
    const newBuilder = new ModifierBuilder<NewR>(this.originalInput as any);
    newBuilder.rules = this.rules;
    newBuilder.maybe = this.maybe.flatMap(fn) as any;
    return newBuilder;
  }
}

class ModifierWithRules<T, R> {
  constructor(
    private originalInput: T,
    private rules: ModifierRule<T, R>[],
    private maybe: Maybe<T>
  ) {}

  map(fn: (value: T) => R): ModifierReady<T, R> {
    return new ModifierReady<T, R>(
      this.originalInput,
      this.rules,
      this.maybe.map(fn)
    );
  }

  flatMap(fn: (value: T) => Maybe<R>): ModifierReady<T, R> {
    return new ModifierReady<T, R>(
      this.originalInput,
      this.rules,
      this.maybe.flatMap(fn)
    );
  }
}

class ModifierReady<T, R> {
  constructor(
    private originalInput: T,
    private rules: ModifierRule<T, R>[],
    private maybe: Maybe<R>
  ) {}

  // Only available when current type matches the modifier rule result type
  unwrap(): Maybe<R> {
    return this.maybe.map(result => {
      // Apply all modifier transformations in order
      let transformedResult = result;
      for (const rule of this.rules) {
        if (rule.predicate(this.originalInput)) {
          transformedResult = rule.transformer(transformedResult, this.originalInput);
        }
      }
      return transformedResult;
    });
  }

  get(): R | null {
    return this.unwrap().get();
  }
}

// Type alias for convenience
type Modifier<T> = ModifierBuilder<T>;
const Modifier = {
  fromValue: <T>(input: T) => ModifierBuilder.fromValue(input)
};
```

### Usage Examples

This would transform the current year handler from:

```ts
export const handleYear: InputHandler = (input, options) => {
  return input
    .map((string) => parseYearWithModifier(string, options))
    .map(({ year, modifier }): [Date, Date] => {
      return applyModifierToDateRange(year, modifier, options);
    })
    .map(attachMetadata(Handler.YEAR));
};
```

To:

```ts
export const handleYear: InputHandler = (input, options) => {
  return input
    .flatMap(text => 
      Modifier.fromValue(text)
        .withModifier(
          (text: string) => /ca\.|c\.|circa/.test(text),
          (text: string) => text.replace(/ca\.|c\.|circa/, "").trim(),
          (dates: [Date, Date]) => [
            startOfYear(sub(dates[0], { years: options.circaStartOffset })),
            endOfYear(add(dates[1], { years: options.circaEndOffset }))
          ]
        )
        .withModifier(
          (text: string) => /after/.test(text),
          (text: string) => text.replace(/after/, "").trim(),
          (dates: [Date, Date]) => [
            add(dates[0], { years: 1 }),
            add(dates[1], { years: options.afterOffset })
          ]
        )
        .map(yearToNumber)
        .map(yearToDate)
        .map((date): [Date, Date] => [startOfYear(date), endOfYear(date)])
        .unwrap()
    )
    .map(attachMetadata(Handler.YEAR));
};
```

### Benefits

1. **Separation of Concerns**: Modifier detection, extraction, and transformation are cleanly separated
2. **Composability**: Multiple modifiers can be chained together declaratively
3. **Consistency**: All handlers use the same modifier pattern
4. **Context Awareness**: Modifiers can behave differently per handler while using the same infrastructure
5. **Functional Style**: Maintains the functional programming patterns already established with Maybe

### Handler-Specific Modifier Behaviors

Different handlers could define their own modifier transformations:

```ts
// Century handler with "early/late" support
const centuryModifiers = (options: EpochizeOptions) => [
  {
    predicate: (text: string) => /early/.test(text),
    extractor: (text: string) => text.replace(/early/, "").trim(),
    transformer: (dates: [Date, Date]) => [
      dates[0], 
      addYears(dates[0], Math.floor((dates[1].getFullYear() - dates[0].getFullYear()) / 3))
    ]
  },
  // ... other century-specific modifiers
];

// Year handler with different modifier behaviors
const yearModifiers = (options: EpochizeOptions) => [
  {
    predicate: (text: string) => /circa/.test(text),
    extractor: (text: string) => text.replace(/ca\.|c\.|circa/, "").trim(),
    transformer: (dates: [Date, Date]) => [
      startOfYear(sub(dates[0], { years: options.circaStartOffset })),
      endOfYear(add(dates[1], { years: options.circaEndOffset }))
    ]
  }
];
```

This approach would eliminate the special-case logic currently scattered throughout `year.ts`, `modifier-phrase.ts`, and `range.ts`, while preserving the functional style and making modifier behaviors explicit and testable.