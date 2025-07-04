export class Maybe<T> {
  private constructor(private value: T | null) {}

  static some<T>(value: T) {
    if (!value) {
      throw Error("Provided value must not be empty");
    }
    return new Maybe(value);
  }

  static none<T>() {
    return new Maybe<T>(null);
  }

  static fromValue<T>(value: T | null) {
    return value ? Maybe.some(value) : Maybe.none<T>();
  }

  get(): T | null {
    return this.value;
  }

  getOrElse(defaultValue: T): T {
    return this.value ?? defaultValue;
  }

  // Try each function in sequence, returning the first non-null result
  flatTryEach<R>(...args: Array<(wrapped: T) => Maybe<R>>): Maybe<R> {
    for (let idx = 0; idx < args.length; idx++) {
      const result = this.flatMap(args[idx]);
      if (result.value !== null) {
        return result;
      }
    }
    return Maybe.none<R>();
  }

  tryEach<R>(...args: Array<(wrapped: T) => R | null>): Maybe<R> {
    for (let idx = 0; idx < args.length; idx++) {
      const result = this.map(args[idx]);
      if (result.value !== null) {
        return result;
      }
    }
    return Maybe.none<R>();
  }

  tryMany<R>(...args: Array<(wrapped: T) => Maybe<R>>): Maybe<R[]> {
    const results: Array<R> = [];
    for (let idx = 0; idx < args.length; idx++) {
      const result = this.flatMap(args[idx]);
      if (result.value !== null) {
        results.push(result.get() as R);
      }
    }
    if (results.length > 0) return Maybe.fromValue(results);
    return Maybe.none<R[]>();
  }

  // Get it? Flat -> Regular -> Curved :D :D :D
  // Just like tryEach, but for functions that expect Maybe already.
  curvedTryEach<R>(...args: Array<(wrapped: Maybe<T>) => Maybe<R>>): Maybe<R> {
    for (let idx = 0; idx < args.length; idx++) {
      const result = args[idx](this);
      if (result.value !== null) {
        return result;
      }
    }
    return Maybe.none<R>();
  }

  flatMap<R>(f: (wrapped: T) => Maybe<R>): Maybe<R> {
    if (this.value === null) {
      return Maybe.none<R>();
    } else {
      return f(this.value);
    }
  }

  map<R>(f: (wrapped: T) => R | null): Maybe<R> {
    if (this.value === null) {
      return Maybe.none<R>();
    } else {
      return Maybe.fromValue(f(this.value));
    }
  }
}
