import { format } from "date-fns";
import { endOfCentury, endOfMillenium, startOfMillenium } from "./util";

describe("startOfMillenium", () => {
  it("returns the start of the current millenium", () => {
    const date = new Date("2020-08-01T00:00:00.000Z");
    const expected = new Date("2001-01-01T00:00:00.000Z");
    const result = startOfMillenium(date);
    expect(result).toEqual(expected);
  });

  it("returns the start of the previous millenium", () => {
    const date = new Date("1400-01-01T00:00:00.000Z");
    const expected = "1001-01-01T00:00:00.000Z";
    const result = startOfMillenium(date);
    expect(format(result, "yyyy-MM-dd'T'HH:mm:ss.000'Z'")).toEqual(expected);
  });

  xit("counts 2000 as part of the 2nd millenium", () => {
    const date = new Date("2000-01-01T00:00:00.000Z");
    const expected = "1001-01-01T00:00:00.000Z";
    const result = startOfMillenium(date);
    expect(format(result, "yyyy-MM-dd'T'HH:mm:ss.000'Z'")).toEqual(expected);
  });
});

describe("endOfMillenium", () => {
  it("returns the end of the current millenium", () => {
    const date = new Date("2020-08-01T00:00:00.000Z");
    const expected = new Date("3000-12-31T23:59:59.999Z");
    const result = endOfMillenium(date);
    expect(result).toEqual(expected);
  });

  it("returns the end of the previous millenium", () => {
    const date = new Date("1001-01-01T00:00:00.000Z");
    const expected = new Date("2000-12-31T23:59:59.999Z");
    const result = endOfMillenium(date);
    expect(result).toEqual(expected);
  });

  it("returns the end of the next millenium", () => {
    const date = new Date("3001-01-01T00:00:00.000Z");
    const expected = new Date("4000-12-31T23:59:59.999Z");
    const result = endOfMillenium(date);
    expect(result).toEqual(expected);
  });
});

describe("endOfCentury", () => {
  it("returns the end of the current century", () => {
    const date = new Date("2020-08-01T00:00:00.000Z");
    const expected = new Date("2100-12-31T23:59:59.999Z");
    const result = endOfCentury(date);
    expect(result).toEqual(expected);
  });

  it("returns the end of the previous century", () => {
    const date = new Date("1910-01-01T00:00:00.000Z");
    const expected = new Date("2000-12-31T23:59:59.999Z");
    const result = endOfCentury(date);
    expect(result).toEqual(expected);
  });

  it("returns the end of the next century", () => {
    const date = new Date("2101-01-01T00:00:00.000Z");
    const expected = new Date("2200-12-31T23:59:59.999Z");
    const result = endOfCentury(date);
    expect(result).toEqual(expected);
  });
});
