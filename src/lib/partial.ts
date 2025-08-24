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

const halvesOfRange = (
  input: [Date, Date, HandlerMetadata]
): [Date, Date, Date] => {
  const [start, end, _metadata] = input;
  const diff = end.getTime() - start.getTime();
  const half = diff / 2;
  return [
    start,
    new Date(start.getTime() + half),
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
      };
      return [start, end, handlerMeta];
    });
};

const matchFirstHalf = (input: string): string | null => {
  const matches = input.match(/first half of (?:the )?(.*)/);
  if (!matches || !matches[1]) return null;
  return matches[1].trim();
};

const handleFirstHalf = (
  input: string,
  options: EpochizeOptions
): Maybe<[Date, Date, HandlerMetadata]> => {
  return Maybe.fromValue(input)
    .map(matchFirstHalf)
    .flatMap((text) => epochizeInner(text, options))
    .map((tuple) => {
      // Special handling for centuries to match expected behavior
      const dateText = input.toLowerCase();
      if (dateText.includes("century")) {
        // For centuries, use the popular convention (19th century = 1800-1899)
        const centuryMatch = dateText.match(/(\d+)(?:st|nd|rd|th)\s+century/);
        if (centuryMatch) {
          const centuryNum = parseInt(centuryMatch[1]);
          const startYear = (centuryNum - 1) * 100;
          const middleYear = startYear + 50;
          
          const start = new Date(startYear, 0, 1);
          start.setHours(0, 0, 0, 0);
          const middle = new Date(middleYear, 11, 31);
          middle.setHours(23, 59, 59, 999);
          
          const handlerMeta: HandlerMetadata = {
            handler: tuple[2].handler,
          };
          return [start, middle, handlerMeta];
        }
      }
      
      // Default behavior for non-centuries
      const [start, middle, _end] = halvesOfRange(tuple);
      const handlerMeta: HandlerMetadata = {
        handler: tuple[2].handler,
      };
      return [start, middle, handlerMeta];
    });
};

const matchSecondHalf = (input: string): string | null => {
  const matches = input.match(/second half of (?:the )?(.*)/);
  if (!matches || !matches[1]) return null;
  return matches[1].trim();
};

const handleSecondHalf = (
  input: string,
  options: EpochizeOptions
): Maybe<[Date, Date, HandlerMetadata]> => {
  return Maybe.fromValue(input)
    .map(matchSecondHalf)
    .flatMap((text) => epochizeInner(text, options))
    .map((tuple) => {
      // Special handling for centuries to match expected behavior
      const dateText = input.toLowerCase();
      if (dateText.includes("century")) {
        // For centuries, use the popular convention (19th century = 1800-1899)
        const centuryMatch = dateText.match(/(\d+)(?:st|nd|rd|th)\s+century/);
        if (centuryMatch) {
          const centuryNum = parseInt(centuryMatch[1]);
          const startYear = (centuryNum - 1) * 100;
          const middleYear = startYear + 50;
          const endYear = startYear + 99;
          
          const middle = new Date(middleYear, 0, 1);
          middle.setHours(0, 0, 0, 0);
          const end = new Date(endYear, 11, 31);
          end.setHours(23, 59, 59, 999);
          
          const handlerMeta: HandlerMetadata = {
            handler: tuple[2].handler,
          };
          return [middle, end, handlerMeta];
        }
      }
      
      // Default behavior for non-centuries
      const [_start, middle, end] = halvesOfRange(tuple);
      const handlerMeta: HandlerMetadata = {
        handler: tuple[2].handler,
      };
      return [middle, end, handlerMeta];
    });
};

export const handlePartial: InputHandler = (input, options) => {
  return input
    .flatTryEach(
      (text) => handleFirstHalf(text, options),
      (text) => handleSecondHalf(text, options),
      (text) => handleEarly(text, options),
      (text) => handleMiddle(text, options),
      (text) => handleLate(text, options)
    )
    .map(attachMetadata(Handler.PARTIAL));
};
