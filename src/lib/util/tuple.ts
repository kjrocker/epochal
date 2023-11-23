interface Metadata {
  handler?: string;
  original?: string;
}

// Poorly named. Want to track some metadata on how the internals are working,
// to help debug tests. Just tracking the original input string, and what handler
// was responsible. I've caught `handleMonth` being used for 'Jan 1 2001'.
export class Tuple<T = [Date, Date]> {
  private constructor(public value: T, public metadata: Metadata = {}) {}

  static fromValue<T>(value: T, meta: Metadata = {}) {
    return new Tuple(value, meta);
  }

  get(): T {
    return this.value;
  }
}
