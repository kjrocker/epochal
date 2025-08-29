import { handleCenturyRange } from "./ranges/century";
import { handleGenericRange } from "./ranges/generic";
import { InputHandler } from "./util/util";

export const handleRange: InputHandler = (input, options) => {
  return input.curvedTryEach(
    (text) => handleCenturyRange(text, options),
    (text) => handleGenericRange(text, options)
  );
};
