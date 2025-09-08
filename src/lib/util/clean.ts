import { identityModifier } from "../modifiers/identity";
import { Maybe } from "./maybe";
import { ordinalToNumber } from "./ordinal-to-number";

const { predicate, extractor } = identityModifier();

export const clean = (input: string): string | null => {
  if (!input) return null;
  return (
    Maybe.fromValue(input)
      .map((text) => text.trim().toLowerCase())
      .map((text) => text.replace(/\s*\(\?\)\s*/g, "").replace(/\s*\?\s*$/, ""))
      .map((text) =>
        text
          .replace(/[-–—‒]/, "-")
          .replace(/^\s*\(\s*(.*?)\s*\)\s*$/, "$1")
          .replace(/^\s*\[\s*(.*?)\s*\]\s*$/, "$1")
          .replace(/^\s*\{\s*(.*?)\s*\}\s*$/, "$1")
      )
      .map((text) => text.replace(/mid-/g, "mid "))
      .map((text) => text.replace(/(,|-|;)$/, ""))
      .map((text) => {
        return predicate(text) ? extractor(text) : text;
      })
      // .map(ordinalToNumber)
      .map((text) => text.replace(/\s+/g, " "))
      .get()
  );
};
