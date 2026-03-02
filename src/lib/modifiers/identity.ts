import { ModifierConfig } from "../util/modifier";
import { InputHandlerReturn } from "../util/util";

export const circaIdentityModifier = (): ModifierConfig<
  string,
  InputHandlerReturn
> => ({
  predicate: (text) => /ca\.|c\.|circa/.test(text),
  extractor: (text) => text.replace(/ca\.|c\.|circa/, "").trim(),
  transformer: (dates: InputHandlerReturn): InputHandlerReturn => dates,
});
