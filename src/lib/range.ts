import { handleCenturyRange } from "./ranges/century";
import { handleGenericRange } from "./ranges/generic";
import { handleMonthRange } from "./ranges/month";
import { handleYearRange } from "./ranges/year";
import { InputHandler } from "./util/util";

export const handleRange: InputHandler = (input, options) => {
  return input.curvedTryEach(
    (text) => handleYearRange(text, options),
    (text) => handleMonthRange(text, options),
    (text) => handleCenturyRange(text, options),
    (text) => handleGenericRange(text, options)
  );
};
