import { handleCenturyRange } from "./ranges/century";
import { handleDayRange } from "./ranges/day";
import { handleGenericRange } from "./ranges/generic";
import { handleMilleniumRange } from "./ranges/millenium";
import { handleMonthRange } from "./ranges/month";
import { handleYearRange } from "./ranges/year";
import { handleYearListRange } from "./ranges/year-list";
import { InputHandler } from "./util/util";

export const handleRange: InputHandler = (input, options) => {
  return input.dutchTryEach(
    (text) => handleDayRange(text, options),
    (text) => handleYearRange(text, options),
    (text) => handleYearListRange(text, options),
    (text) => handleMonthRange(text, options),
    (text) => handleCenturyRange(text, options),
    (text) => handleMilleniumRange(text, options),
    (text) => handleGenericRange(text, options)
  );
};
