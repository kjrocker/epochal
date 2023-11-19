import isDate from "date-fns/isDate";
import isValid from "date-fns/isValid";

export const clean = (str: string): string | null => {
  if (!str) return null;
  const cleaned = str.trim().toLowerCase();
  if (!cleaned || cleaned === "") return null;
  return cleaned;
};

export const isValidDate = (d: Date) => (isDate(d) && isValid(d) ? d : null);
