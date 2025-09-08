import { Maybe } from "./maybe";

// Helper functions that can return null for testing
const divide = (a: number, b: number): number | null => {
  return b === 0 ? null : a / b;
};

const parseNumber = (str: string): number | null => {
  const parsed = parseFloat(str);
  return isNaN(parsed) ? null : parsed;
};

const getProperty = (
  obj: Record<string, unknown>,
  key: string
): unknown | null => {
  return obj && Object.prototype.hasOwnProperty.call(obj, key)
    ? obj[key]
    : null;
};

const findInArray = <T>(
  arr: T[],
  predicate: (item: T) => boolean
): T | null => {
  const found = arr.find(predicate);
  return found !== undefined ? found : null;
};

// Functions that return Maybe<T>
const safeDivide = (a: number, b: number): Maybe<number> => {
  return b === 0 ? Maybe.none() : Maybe.some(a / b);
};

const safeSqrt = (n: number): Maybe<number> => {
  return n < 0 ? Maybe.none() : Maybe.some(Math.sqrt(n));
};

describe("Maybe", () => {
  describe("construction", () => {
    it("should create Some with valid value", () => {
      const maybe = Maybe.some(42);
      expect(maybe.get()).toBe(42);
    });

    it("should throw error when creating Some with falsy value", () => {
      expect(() => Maybe.some(null)).toThrow(
        "Provided value must not be empty"
      );
      expect(() => Maybe.some(undefined)).toThrow(
        "Provided value must not be empty"
      );
      expect(() => Maybe.some("")).toThrow("Provided value must not be empty");
      expect(() => Maybe.some(0)).toThrow("Provided value must not be empty");
      expect(() => Maybe.some(false)).toThrow(
        "Provided value must not be empty"
      );
    });

    it("should create None", () => {
      const maybe = Maybe.none<number>();
      expect(maybe.get()).toBeNull();
    });

    it("should create from value - truthy", () => {
      const maybe = Maybe.fromValue(42);
      expect(maybe.get()).toBe(42);
    });

    it("should create from value - null", () => {
      const maybe = Maybe.fromValue(null);
      expect(maybe.get()).toBeNull();
    });
  });

  describe("get and getOrElse", () => {
    it("should get value from Some", () => {
      const maybe = Maybe.some("hello");
      expect(maybe.get()).toBe("hello");
    });

    it("should get null from None", () => {
      const maybe = Maybe.none<string>();
      expect(maybe.get()).toBeNull();
    });

    it("should return value when Some", () => {
      const maybe = Maybe.some(42);
      expect(maybe.getOrElse(0)).toBe(42);
    });

    it("should return default when None", () => {
      const maybe = Maybe.none<number>();
      expect(maybe.getOrElse(99)).toBe(99);
    });
  });

  describe("map", () => {
    it("should transform value in Some", () => {
      const maybe = Maybe.some(5);
      const result = maybe.map((x) => x * 2);
      expect(result.get()).toBe(10);
    });

    it("should handle transformation that returns null", () => {
      const maybe = Maybe.some(10);
      const result = maybe.map((x) => divide(x, 0));
      expect(result.get()).toBeNull();
    });

    it("should short-circuit on None", () => {
      const maybe = Maybe.none<number>();
      const result = maybe.map((x) => x * 2);
      expect(result.get()).toBeNull();
    });

    it("should work with string operations", () => {
      const maybe = Maybe.some("hello");
      const result = maybe.map((s) => s.toUpperCase());
      expect(result.get()).toBe("HELLO");
    });

    it("should chain multiple map operations", () => {
      const maybe = Maybe.some(4);
      const result = maybe.map((x) => x * 2).map((x) => x + 1);
      expect(result.get()).toBe(9);
    });
  });

  describe("flatMap", () => {
    it("should flatten nested Maybe from Some", () => {
      const maybe = Maybe.some(8);
      const result = maybe.flatMap((x) => safeDivide(x, 2));
      expect(result.get()).toBe(4);
    });

    it("should handle function that returns None", () => {
      const maybe = Maybe.some(5);
      const result = maybe.flatMap((x) => safeDivide(x, 0));
      expect(result.get()).toBeNull();
    });

    it("should short-circuit on None", () => {
      const maybe = Maybe.none<number>();
      const result = maybe.flatMap((x) => safeDivide(x, 2));
      expect(result.get()).toBeNull();
    });

    it("should chain multiple flatMap operations", () => {
      const maybe = Maybe.some(16);
      const result = maybe
        .flatMap((x) => safeSqrt(x))
        .flatMap((x) => safeDivide(x, 2));
      expect(result.get()).toBe(2);
    });
  });

  describe("tryEach", () => {
    it("should return first successful transformation", () => {
      const maybe = Maybe.some("42");
      const result = maybe.tryEach(
        (s) => parseNumber(s + "invalid"),
        (s) => parseNumber(s),
        (s) => s.length
      );
      expect(result.get()).toBe(42);
    });

    it("should try all functions until one succeeds", () => {
      const maybe = Maybe.some("not-a-number");
      const result = maybe.tryEach(
        (s) => parseNumber(s),
        (s) => (s.length > 20 ? s.length : null),
        (s) => (s.includes("number") ? 1 : null)
      );
      expect(result.get()).toBe(1);
    });

    it("should return None if all functions fail", () => {
      const maybe = Maybe.some("test");
      const result = maybe.tryEach(
        (s) => parseNumber(s),
        (s) => (s.length > 10 ? s.length : null)
      );
      expect(result.get()).toBeNull();
    });

    it("should short-circuit on None input", () => {
      const maybe = Maybe.none<string>();
      const result = maybe.tryEach(
        (s) => parseNumber(s),
        (s) => s.length
      );
      expect(result.get()).toBeNull();
    });
  });

  describe("flatTryEach", () => {
    it("should return first successful Maybe transformation", () => {
      const maybe = Maybe.some(9);
      const result = maybe.flatTryEach(
        (x) => (x < 0 ? Maybe.some(x) : Maybe.none()),
        (x) => safeSqrt(x),
        (x) => safeDivide(x, 3)
      );
      expect(result.get()).toBe(3);
    });

    it("should continue until finding non-None result", () => {
      const maybe = Maybe.some(-4);
      const result = maybe.flatTryEach(
        (x) => safeSqrt(x),
        (x) => safeDivide(x, 0),
        (x) => Maybe.some(Math.abs(x))
      );
      expect(result.get()).toBe(4);
    });

    it("should return None if all transformations return None", () => {
      const maybe = Maybe.some(5);
      const result = maybe.flatTryEach(
        (x) => safeDivide(x, 0),
        (x) => safeSqrt(-x)
      );
      expect(result.get()).toBeNull();
    });
  });

  describe("tryMany", () => {
    it("should collect all successful transformations", () => {
      const maybe = Maybe.some(16);
      const result = maybe.tryMany(
        (x) => safeSqrt(x),
        (x) => safeDivide(x, 2),
        (x) => safeDivide(x, 0),
        (x) => Maybe.some(x + 1)
      );
      const results = result.get();
      expect(results).toEqual([4, 8, 17]);
    });

    it("should return None if no transformations succeed", () => {
      const maybe = Maybe.some(10);
      const result = maybe.tryMany(
        (x) => safeDivide(x, 0),
        (x) => safeSqrt(-x)
      );
      expect(result.get()).toBeNull();
    });

    it("should return empty array wrapped in Maybe if input is None", () => {
      const maybe = Maybe.none<number>();
      const result = maybe.tryMany(
        (x) => safeSqrt(x),
        (x) => safeDivide(x, 2)
      );
      expect(result.get()).toBeNull();
    });
  });

  describe("dutchTryEach", () => {
    const acceptSome = (maybe: Maybe<number>): Maybe<string> => {
      const value = maybe.get();
      return value !== null ? Maybe.some(`value: ${value}`) : Maybe.none();
    };

    const acceptEven = (maybe: Maybe<number>): Maybe<string> => {
      const value = maybe.get();
      return value !== null && value % 2 === 0
        ? Maybe.some(`even: ${value}`)
        : Maybe.none();
    };

    const acceptPositive = (maybe: Maybe<number>): Maybe<string> => {
      const value = maybe.get();
      return value !== null && value > 0
        ? Maybe.some(`positive: ${value}`)
        : Maybe.none();
    };

    it("should return first successful curved transformation", () => {
      const maybe = Maybe.some(4);
      const result = maybe.dutchTryEach(
        (m) => Maybe.none<string>(),
        acceptEven,
        acceptPositive
      );
      expect(result.get()).toBe("even: 4");
    });

    it("should work with None input", () => {
      const maybe = Maybe.none<number>();
      const result = maybe.dutchTryEach(acceptSome, acceptEven);
      expect(result.get()).toBeNull();
    });

    it("should return None if all curved functions return None", () => {
      const maybe = Maybe.some(-3);
      const result = maybe.dutchTryEach(acceptEven, acceptPositive);
      expect(result.get()).toBeNull();
    });
  });

  describe("complex scenarios", () => {
    it("should handle object property access safely", () => {
      const obj = { name: "Alice", age: 30 };
      const maybe = Maybe.some(obj);

      const name = maybe.map((o) => getProperty(o, "name"));
      const email = maybe.map((o) => getProperty(o, "email"));

      expect(name.get()).toBe("Alice");
      expect(email.get()).toBeNull();
    });

    it("should handle array operations safely", () => {
      const numbers = [1, 2, 3, 4, 5];
      const maybe = Maybe.some(numbers);

      const evenNumber = maybe.map((arr) =>
        findInArray(arr, (n) => n % 2 === 0)
      );
      const largeNumber = maybe.map((arr) => findInArray(arr, (n) => n > 10));

      expect(evenNumber.get()).toBe(2);
      expect(largeNumber.get()).toBeNull();
    });

    it("should compose operations in a pipeline", () => {
      const input = Maybe.some("25");

      const result = input
        .map(parseNumber)
        .flatMap((n) => safeSqrt(n))
        .map((n) => Math.round(n));

      expect(result.get()).toBe(5);
    });

    it("should handle failure in pipeline gracefully", () => {
      const input = Maybe.some("not-a-number");

      const result = input
        .map(parseNumber)
        .flatMap((n) => safeSqrt(n))
        .map((n) => Math.round(n));

      expect(result.get()).toBeNull();
    });

    it("should work with conditional logic", () => {
      const processValue = (n: number): Maybe<string> => {
        return Maybe.some(n).tryEach(
          (x) => (x > 100 ? "large" : null),
          (x) => (x > 10 ? "medium" : null),
          (x) => (x > 0 ? "small" : null)
        );
      };

      expect(processValue(150).get()).toBe("large");
      expect(processValue(50).get()).toBe("medium");
      expect(processValue(5).get()).toBe("small");
      expect(processValue(-1).get()).toBeNull();
    });
  });
});
