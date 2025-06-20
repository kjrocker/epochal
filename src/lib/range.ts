import { epochizeInner } from ".";
import {
  attachMetadata,
  InputHandler,
  mergeMetadataPublic,
  Metadata,
  Handler,
} from "./util/util";
import { EpochizeOptions } from "./util/options";

const matchTo = (input: string): [string, string] | null => {
  const matches = input.split("to");
  if (matches.length !== 2) return null;
  return matches as [string, string];
};

const handleSplitStrings = (
  [first, second]: [string, string],
  options: EpochizeOptions
): [Date, Date, Metadata] | null => {
  const startResult = epochizeInner(first, options).get();
  const endResult = epochizeInner(second, options).get();
  if (startResult === null || endResult === null) return null;

  // Merge metadata from both parts of the range
  const mergedMeta = mergeMetadataPublic(startResult[2], endResult[2]);

  return [startResult[0], endResult[1], mergedMeta];
};

export const handleRange: InputHandler = (input, options) => {
  return input
    .map(matchTo)
    .map((parts) => handleSplitStrings(parts, options))
    .map(attachMetadata(Handler.RANGE, input.getOrElse("")));
};
