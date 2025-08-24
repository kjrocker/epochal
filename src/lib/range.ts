import { epochizeInner } from ".";
import {
  attachMetadata,
  InputHandler,
  mergeMetadata,
  HandlerMetadata,
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
): [Date, Date, HandlerMetadata] | null => {
  const startResult = epochizeInner(first, options).get();
  const endResult = epochizeInner(second, options).get();
  if (startResult === null || endResult === null) return null;

  // Merge metadata from both parts of the range (extract HandlerMetadata part)
  const startHandlerMeta: HandlerMetadata = {
    handler: startResult[2].handler,
  };
  const endHandlerMeta: HandlerMetadata = {
    handler: endResult[2].handler,
  };
  const mergedMeta = mergeMetadata(startHandlerMeta, endHandlerMeta);

  return [startResult[0], endResult[1], mergedMeta];
};

export const handleRange: InputHandler = (input, options) => {
  return input
    .map(matchTo)
    .map((parts) => handleSplitStrings(parts, options))
    .map(attachMetadata(Handler.RANGE));
};
