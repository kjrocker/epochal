import { Maybe } from "./maybe";

export { Modifier };

interface ModifierRule<T, R> {
  predicate: (input: T) => boolean;
  extractor: (input: T) => T; // removes the modifier from input
  transformer: (result: R, originalInput: T) => R; // applies the modifier to final result
}

export interface ModifierConfig<T, R> {
  predicate: (input: T) => boolean;
  extractor: (input: T) => T;
  transformer: (result: R, originalInput: T) => R;
}

const cleanInput = <T, R>(input: T, rules: ModifierRule<T, R>[]): T => {
  let result = input;
  for (const rule of rules) {
    if (rule.predicate(result)) {
      result = rule.extractor(result);
    }
  }
  return result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyModifierRule<T> = ModifierRule<T, any>;

class Modifier<T, Current, Target = Current> {
  private rules: AnyModifierRule<T>[] = [];
  private maybe: Maybe<Current>;
  private originalInput: T;

  constructor(
    input: T,
    maybe?: Maybe<Current>,
    rules?: AnyModifierRule<T>[]
  ) {
    this.maybe = maybe ?? Maybe.fromValue(input as unknown as Current);
    this.originalInput = input;
    this.rules = rules ?? [];
  }

  static fromValue<T>(input: T): Modifier<T, T, T> {
    return new Modifier(input);
  }

  withModifier<R>(config: ModifierConfig<T, R>): Modifier<T, T, R> {
    const newRules = [
      ...this.rules,
      { 
        predicate: config.predicate, 
        extractor: config.extractor, 
        transformer: config.transformer 
      },
    ];

    const cleanedInput = cleanInput(this.originalInput, newRules);

    return new Modifier<T, T, R>(
      this.originalInput,
      Maybe.fromValue(cleanedInput),
      newRules
    );
  }

  map<NewR>(fn: (value: Current) => NewR | null): Modifier<T, NewR, Target> {
    return new Modifier<T, NewR, Target>(
      this.originalInput,
      this.maybe.map(fn),
      this.rules
    );
  }

  flatMap<NewR>(
    fn: (value: Current) => Maybe<NewR>
  ): Modifier<T, NewR, Target> {
    return new Modifier<T, NewR, Target>(
      this.originalInput,
      this.maybe.flatMap(fn),
      this.rules
    );
  }

  // Only available when Current matches Target
  unwrap(this: Modifier<T, Target, Target>): Maybe<Target> {
    return this.maybe.map((result) => {
      // Apply all modifier transformations in order
      let transformedResult = result;
      for (const rule of this.rules) {
        if (rule.predicate(this.originalInput)) {
          transformedResult = rule.transformer(
            transformedResult,
            this.originalInput
          );
        }
      }
      return transformedResult;
    });
  }

  // Only available when Current matches Target
  get(this: Modifier<T, Target, Target>): Target | null {
    return this.unwrap().get();
  }
}
