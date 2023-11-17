import endOfDay from "date-fns/endOfDay";
import endOfMonth from "date-fns/endOfMonth";
import endOfYear from "date-fns/endOfYear";
import startOfDay from "date-fns/startOfDay";
import startOfMonth from "date-fns/startOfMonth";
import startOfYear from "date-fns/startOfYear";
import {
  endOfCentury,
  endOfDecade,
  endOfMillenium,
  startOfCentury,
  startOfDecade,
  startOfMillenium,
} from "./util";
import { TimePrecision } from "../parser/types";

export const getStartDate = (date: Date, precision: TimePrecision): Date => {
  switch (precision) {
    case TimePrecision.DAY:
      return startOfDay(date);
    case TimePrecision.MONTH:
      return startOfMonth(date);
    case TimePrecision.YEAR:
      return startOfYear(date);
    case TimePrecision.DECADE:
      return startOfDecade(date);
    case TimePrecision.CENTURY:
      return startOfCentury(date);
    case TimePrecision.MILLENIUM:
      return startOfMillenium(date);
    default:
      return date;
  }
};

export const getEndDate = (date: Date, precision: TimePrecision): Date => {
  switch (precision) {
    case TimePrecision.DAY:
      return endOfDay(date);
    case TimePrecision.MONTH:
      return endOfMonth(date);
    case TimePrecision.YEAR:
      return endOfYear(date);
    case TimePrecision.DECADE:
      return endOfDecade(date);
    case TimePrecision.CENTURY:
      return endOfCentury(date);
    case TimePrecision.MILLENIUM:
      return endOfMillenium(date);
    default:
      return date;
  }
};
