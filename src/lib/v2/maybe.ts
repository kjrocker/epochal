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

  getOrElse(defaultValue: T) {
    return this.value === null ? defaultValue : this.value;
  }

  // Try each function in sequence, returning the first non-null result
  tryEach<R>(...args: Array<(wrapped: T) => Maybe<R>>): Maybe<R> {
    for (let idx = 0; idx < args.length; idx++) {
      const result = this.flatMap(args[idx]);
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
}
