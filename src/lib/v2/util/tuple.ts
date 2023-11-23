interface Metadata {
  handler?: string;
  original?: string;
}

export class Tuple<T = [Date, Date]> {
  private constructor(public value: T, public metadata: Metadata = {}) {}

  static fromValue<T>(value: T, meta: Metadata = {}) {
    return new Tuple(value, meta);
  }

  get(): T {
    return this.value;
  }
}
