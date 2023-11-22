import { parseTextToDate as epochize_old } from "./lib/parser";
import { epochize as epochize_new } from "./lib/v2";

export const epochize = (input: string): [Date, Date] | null => {
  // return epochize_old(input) ?? null;
  return epochize_new(input) ?? null;
  return epochize_new(input) ?? epochize_old(input) ?? null;
};
