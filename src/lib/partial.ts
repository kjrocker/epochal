import { epochizeInner } from ".";
import { Maybe } from "./util/maybe";
import {
  attachMetadata,
  Handler,
  InputHandler,
  HandlerMetadata,
} from "./util/util";
import { EpochizeOptions } from "./util/options";

const thirdsOfRange = (
  input: [Date, Date, HandlerMetadata]
): [Date, Date, Date, Date] => {
  const [start, end, _metadata] = input;
  const diff = end.getTime() - start.getTime();
  const third = diff / 3;
  return [
    start,
    new Date(start.getTime() + third),
    new Date(start.getTime() + 2 * third),
    end,
  ];
};

const matchEarly = (input: string): string | null => {
  const matches = input.match(/(?<=early).*/);
  if (!matches || !matches[0]) return null;
  return matches[0];
};

const handleEarly = (
  input: string,
  options: EpochizeOptions
): Maybe<[Date, Date, HandlerMetadata]> => {
  return Maybe.fromValue(input)
    .map(matchEarly)
    .flatMap((text) => epochizeInner(text, options))
    .map((tuple) => {
      const [start, end, _third, _fourth] = thirdsOfRange(tuple);
      const handlerMeta: HandlerMetadata = {
        handler: tuple[2].handler,
        original: tuple[2].original,
      };
      return [start, end, handlerMeta];
    });
};

const matchMiddle = (input: string): string | null => {
  const matches = input.match(/(?<=mid).*/);
  if (!matches || !matches[0]) return null;
  return matches[0];
};

const handleMiddle = (
  input: string,
  options: EpochizeOptions
): Maybe<[Date, Date, HandlerMetadata]> => {
  return Maybe.fromValue(input)
    .map(matchMiddle)
    .flatMap((text) => epochizeInner(text, options))
    .map((tuple) => {
      const [_first, start, end, _fourth] = thirdsOfRange(tuple);
      const handlerMeta: HandlerMetadata = {
        handler: tuple[2].handler,
        original: tuple[2].original,
      };
      return [start, end, handlerMeta];
    });
};

const matchLate = (input: string): string | null => {
  const matches = input.match(/(?<=late).*/);
  if (!matches || !matches[0]) return null;
  return matches[0];
};

const handleLate = (
  input: string,
  options: EpochizeOptions
): Maybe<[Date, Date, HandlerMetadata]> => {
  return Maybe.fromValue(input)
    .map(matchLate)
    .flatMap((text) => epochizeInner(text, options))
    .map((tuple) => {
      const [_first, _second, start, end] = thirdsOfRange(tuple);
      const handlerMeta: HandlerMetadata = {
        handler: tuple[2].handler,
        original: tuple[2].original,
      };
      return [start, end, handlerMeta];
    });
};

export const handlePartial: InputHandler = (input, options) => {
  return input
    .flatTryEach(
      (text) => handleEarly(text, options),
      (text) => handleMiddle(text, options),
      (text) => handleLate(text, options)
    )
    .map(attachMetadata(Handler.PARTIAL, input.getOrElse("")));
};
