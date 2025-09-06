import { handleCenturyRange } from "./ranges/century";
import { handleGenericRange } from "./ranges/generic";
import { handleYearRange } from "./ranges/year";
import { InputHandler } from "./util/util";

export const handleRange: InputHandler = (input, options) => {
  return input.curvedTryEach(
    (text) => handleYearRange(text, options),
    (text) => handleCenturyRange(text, options),
    (text) => handleGenericRange(text, options)
  );
};
