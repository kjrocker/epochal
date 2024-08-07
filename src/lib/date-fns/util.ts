import { toDate } from "date-fns/toDate";

export type Era = "BCE" | "CE";

export function getEra(dirtyDate: Date | number): "BCE" | "CE" {
  const date = toDate(dirtyDate);
  const year = date.getFullYear();
  return year < 0 ? "BCE" : "CE";
}

export function endOfDecade(dirtyDate: Date | number): Date {
  const date = toDate(dirtyDate);
  const year = date.getFullYear();
  const decade = 9 + Math.floor(year / 10) * 10;
  if (decade > -10 && decade <= -1) {
    date.setFullYear(0, 11, 31);
    date.setHours(23, 59, 59, 999);
    return date;
  }
  date.setFullYear(decade > 0 ? decade : decade + 2, 11, 31);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function endOfCentury(dirtyDate: Date | number): Date {
  const date = toDate(dirtyDate);
  const year = date.getFullYear();
  const century = 99 + Math.floor(year / 100) * 100;
  date.setFullYear(century + 1, 11, 31);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function endOfMillenium(dirtyDate: Date | number): Date {
  const date = toDate(dirtyDate);
  const year = date.getFullYear();
  const millenium = 999 + Math.floor(year / 1000) * 1000;
  date.setFullYear(millenium + 1, 11, 31);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function startOfDecade(dirtyDate: Date | number): Date {
  const date = toDate(dirtyDate);
  const year = date.getFullYear();
  let decade: number;
  decade = Math.floor(year / 10) * 10;
  if (decade === 0 && year < 0) {
    date.setFullYear(-2, 0, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  } else if (decade === 0 && year > 0) {
    decade = 1;
  }
  date.setFullYear(decade > 0 ? decade : decade + 2, 0, 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function startOfCentury(dirtyDate: Date | number): Date {
  const date = toDate(dirtyDate);
  const year = date.getFullYear();
  const century = Math.floor(year / 100) * 100;
  date.setFullYear(century + 1, 0, 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function startOfMillenium(dirtyDate: Date | number): Date {
  const date = toDate(dirtyDate);
  const year = date.getFullYear();
  const millenium = Math.floor(year / 1000) * 1000;
  date.setFullYear(millenium + 1, 0, 1);
  date.setHours(0, 0, 0, 0);
  return date;
}
