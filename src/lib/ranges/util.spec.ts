import { matchTo } from "./util";

describe("matchTo", () => {
  it("doesn't match October", () => {
    expect(matchTo("01 October 1918")).toBeNull();
  });
});
