import { epochizeInner } from ".";
import { Handler } from "./util/util";

describe("recursive metadata", () => {
  it("should preserve and merge metadata from recursive calls in handlePartial", () => {
    const result = epochizeInner("early 1990s").get();
    expect(result).not.toBeNull();
    if (result) {
      const [_start, _end, metadata] = result;

      // Should have both handlePartial and handleDecade in the handler chain
      expect(metadata.handler).toContain(Handler.PARTIAL);
      expect(metadata.handler).toContain(Handler.DECADE);
      expect(metadata.original).toBe("early 1990s");
    }
  });

  it("should preserve and merge metadata from recursive calls in handleRange", () => {
    const result = epochizeInner("1990 to 2000").get();
    expect(result).not.toBeNull();
    if (result) {
      const [_start, _end, metadata] = result;

      // Should have handleRange and handleYear in the handler chain
      expect(metadata.handler).toContain(Handler.RANGE);
      expect(metadata.handler).toContain(Handler.YEAR);
      expect(metadata.original).toBe("1990 to 2000");
    }
  });

  it("should handle nested recursive calls properly", () => {
    const result = epochizeInner("early 1990s to late 2000s").get();
    expect(result).not.toBeNull();
    if (result) {
      const [_start, _end, metadata] = result;

      // Should contain multiple handlers from nested calls
      expect(metadata.handler).toContain(Handler.RANGE);
      expect(metadata.handler).toContain(Handler.PARTIAL);
      expect(metadata.handler).toContain(Handler.DECADE);
      expect(metadata.original).toBe("early 1990s to late 2000s");
    }
  });
});
