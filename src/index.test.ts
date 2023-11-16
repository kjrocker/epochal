import { parse } from "./index";

describe("parse", () => {
  it("should return the input", () => {
    expect(parse("foo")).toEqual("foo");
  });
});
