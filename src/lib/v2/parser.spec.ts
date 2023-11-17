import { epochize } from "./parser";

describe("parser", () => {
  it("handles undefined", () => {
    // @ts-expect-error
    const actual = epochize(undefined);
    expect(actual).toBe(null);
  });

  it("returns something in the first millennium", () => {
    const actual = epochize("1st millennium");
    console.log(actual);
    expect(actual).toMatchInlineSnapshot(`
[
  0001-01-01T00:00:00.000Z,
  1000-12-31T23:59:59.999Z,
]
`);
  });

  it("returns something in the second millennium", () => {
    const actual = epochize("2nd millennium");
    console.log(actual);
    expect(actual).toMatchInlineSnapshot(`
[
  1001-01-01T00:00:00.000Z,
  2000-12-31T23:59:59.999Z,
]
`);
  });

  it("returns something in the first millennium BC", () => {
    const actual = epochize("1st millennium BC");
    console.log(actual);
    expect(actual).toMatchInlineSnapshot(`null`);
  });

  it("returns something in the second millennium BC", () => {
    const actual = epochize("2nd millennium BC");
    console.log(actual);
    expect(actual).toMatchInlineSnapshot(`null`);
  });
});
