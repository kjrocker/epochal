import { add, sub } from "date-fns";
import { EpochizeOptions } from "./util/options";
import {
  attachMetadata,
  Handler,
  InputHandler,
  ResultMetadata,
} from "./util/util";
import { epochizeInner } from ".";

const parseAfter = (
  input: string,
  options: EpochizeOptions
): [Date, Date, ResultMetadata] | null => {
  const isMatch = /after/.test(input);
  if (!isMatch) return null;

  const newString = input.replace(/after/, "");
  const result = epochizeInner(newString, options).get();
  if (!result) return null;

  const [startDate, endDate, metadata] = result;

  const start = add(startDate, { years: 1 });
  const end = add(endDate, { years: options.afterOffset });

  return [start, end, metadata];
};

export const handleModifierPhrase: InputHandler = (input, options) => {
  return input
    .map((text) => parseAfter(text, options))
    .map(attachMetadata(Handler.MODIFIER_PHRASE));
};
