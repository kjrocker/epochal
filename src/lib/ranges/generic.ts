import { epochizeInner } from "../index";
import {
  attachMetadata,
  InputHandler,
  mergeMetadata,
  HandlerMetadata,
  Handler,
} from "../util/util";
import { EpochizeOptions } from "../util/options";
import { matchDash, matchSemicolon, matchSlash, matchTo } from "./util";

const handleSplitStrings = (
  [first, second]: [string, string],
  options: EpochizeOptions
): [Date, Date, HandlerMetadata] | null => {
  const startResult = epochizeInner(first, options).get();

  // For the end part, if it contains circa indicators, swap the circa offsets so that
  // circaEndOffset gets applied to the end date instead of circaStartOffset
  const endOptions = /ca\.|c\.|circa/.test(second)
    ? {
        ...options,
        circaStartOffset: options.circaEndOffset,
        circaEndOffset: options.circaStartOffset,
      }
    : options;

  const endResult = epochizeInner(second, endOptions).get();
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

export const handleGenericRange: InputHandler = (input, options) => {
  return input
    .tryEach(matchTo, matchDash, matchSlash, matchSemicolon)
    .map((parts) => handleSplitStrings(parts, options))
    .map(attachMetadata(Handler.RANGE));
};
