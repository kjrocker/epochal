import { endOfMonth, startOfMonth } from "date-fns";
import { ModifierConfig } from "../util/modifier";

const seasonSlashRegex =
  /(?:(?:spring|summer|fall|winter)(?:\/(?:spring|summer|fall|winter))?)/i;
const seasonAndRegex =
  /(?:(?:spring|summer|fall|winter)\s+(?:and|&)\s+(?:spring|summer|fall|winter))/i;
const seasonOfRegex =
  /(?:(?:spring|summer|fall|winter)\s+of)/i;

const getSeasonStartMonth = (season: string) => {
  switch (season) {
    case "spring":
      return 3;
    case "summer":
      return 6;
    case "fall":
      return 9;
    case "winter":
      return 12;
    default:
      return 1;
  }
};

const getSeasonEndMonth = (season: string) => {
  switch (season) {
    case "spring":
      return 5;
    case "summer":
      return 8;
    case "fall":
      return 11;
    case "winter":
      return 2;
    default:
      return 12;
  }
};

export const seasonModifier = (): ModifierConfig<string, [Date, Date]> => ({
  predicate: (text) => 
    seasonSlashRegex.test(text) || 
    seasonAndRegex.test(text) || 
    seasonOfRegex.test(text),
  extractor: (text: string): string => {
    let extracted = text;
    
    // Try each regex in sequence to find and remove the season pattern
    if (seasonAndRegex.test(extracted)) {
      extracted = extracted.replace(seasonAndRegex, "").trim();
    } else if (seasonOfRegex.test(extracted)) {
      extracted = extracted.replace(seasonOfRegex, "").trim();
    } else if (seasonSlashRegex.test(extracted)) {
      extracted = extracted.replace(seasonSlashRegex, "").trim();
    }
    
    // For year ranges like "2027-28", extract just the first year
    const yearRangeMatch = extracted.match(/(\d{4})-\d{2,4}/);
    if (yearRangeMatch) {
      extracted = yearRangeMatch[1];
    }
    return extracted;
  },
  transformer: (dates: [Date, Date], text): [Date, Date] => {
    const seasons = text.match(/spring|summer|fall|winter/gi) || [];
    const firstSeason = seasons[0]?.toLowerCase();
    const lastSeason = seasons[seasons.length - 1]?.toLowerCase();

    const startMonth = getSeasonStartMonth(firstSeason || "spring");
    const endMonth = getSeasonEndMonth(lastSeason || "spring");
    const startDate = new Date(dates[0].getFullYear(), startMonth - 1, 1);
    
    // Check if there's an explicit year range like "2027-28"
    const yearRangeMatch = text.match(/\d{4}-(\d{2,4})/);
    let endYear = dates[1].getFullYear();
    
    if (yearRangeMatch) {
      const secondYearStr = yearRangeMatch[1];
      if (secondYearStr.length === 2) {
        // Handle 2-digit year like "27-28"
        const century = Math.floor(dates[0].getFullYear() / 100) * 100;
        endYear = century + parseInt(secondYearStr, 10);
      } else {
        // Handle 4-digit year
        endYear = parseInt(secondYearStr, 10);
      }
    } else if (lastSeason === "winter") {
      // Default winter behavior - extend to next year
      endYear = dates[0].getFullYear() + 1;
    }
    
    const endDate = new Date(endYear, endMonth, 0);
    return [startOfMonth(startDate), endOfMonth(endDate)];
  },
});
