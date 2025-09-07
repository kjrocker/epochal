// Tests based in some way on the Metropolitian Museum Dataset
import { epochize } from "./index";
import { type EpochizeOptions } from "./util/options";

const formalOptions = { convention: "formal" as const };

const METROPOLITAN_TEST_CASES: Array<[string, number, number]> = [
  ["1853", 1853, 1853],
  ["1901", 1901, 1901],
  ["1909–27", 1909, 1927],
  ["1650–1700", 1650, 1700],
  ["1720–40", 1720, 1740],
  ["1700–1730", 1700, 1730],
  ["1787–1810", 1787, 1810],
  ["ca. 1830–40", 1827, 1840],
  ["1800–1815", 1800, 1815],
  ["1835–40", 1835, 1840],
  ["ca. 1650", 1647, 1650],
  ["ca. 1833–46", 1830, 1846],
  ["ca. 1683", 1680, 1683],
  ["ca. 1832–39", 1829, 1839],
  ["ca. 1910–20", 1907, 1920],
  ["1820–40", 1820, 1840],
  ["1852–58", 1852, 1858],
  ["1755–60", 1755, 1760],
  ["ca. 1853–58", 1850, 1858],
  ["after 1909", 1910, 1919],
  ["after 1886", 1887, 1896],
  ["1811", 1811, 1811],
  ["1908–12", 1908, 1912],
  ["1700–1710", 1700, 1710],
  ["after 1893", 1894, 1903],
  ["1787 (?)", 1787, 1787],
  ["1777 (?)", 1777, 1777],
  ["1800–1900 (?)", 1800, 1900],
  ["ca. 1900–1915", 1897, 1915],
  ["ca. 1804–ca. 1835", 1801, 1838],
  ["18th–19th century", 1701, 1900],
  ["18th and 19th century", 1701, 1900],
  ["19th–20th century", 1801, 2000],
  ["1804–after 1860", 1804, 1870],
  ["1771–76 (?)", 1771, 1776],
  ["18th century or early 19th century", 1701, 1834],
  ["First half of the 19th century", 1801, 1851],
  ["1897–98 (?)", 1897, 1898],
  ["ca. 1806 or 1811", 1803, 1811],
  ["datable to 1673", 1673, 1673],
  ["dated 1644", 1644, 1644],
  ["dated 1757?", 1757, 1757],
  ["3rd quarter of the 19th century", 1851, 1876],
  ["possibly 1931", 1931, 1931],
  ["probably 1931", 1931, 1931],
  ["mid-19th century", 1834, 1867],
  ["Second quarter of 20th century", 1926, 1951],
  ["First quarter of 20th century", 1901, 1926],
  ["first half of the19th century", 1801, 1851],
  ["September, 1918", 1918, 1918],
  ["before 1876", 1866, 1875],
  ["early 17th century", 1601, 1634],
  ["[1980]", 1980, 1980],
  ["(1980)", 1980, 1980],
  ["1887 or later", 1887, 1897],
  ["late 13th–first half 14th century", 1267, 1351],
  ["1184–1153 BC", -1183, -1152],
  ["1184–1153 B.C.", -1183, -1152],
  ["June–July 1834", 1834, 1834],
  ["ca. 1184–1153 B.C.", -1186, -1152],
  ["10th–11th century or later", 901, 1100],
  ["late 16th–mid-17th century", 1567, 1667],
  ["mid-7th–end of the 6th century BCE", -666, -500],
  ["mid-16th–mid-17th century", 1534, 1667],
  ["7th–6th millennium BCE", -6999, -5000],
  ["April 22–24, 1865", 1865, 1865],
  ["dated A.H. 369/ 979 CE", 979, 979],
  ["1969 / 1981", 1969, 1981],
  ["1969 /1981", 1969, 1981],
  ["1969/ 1981", 1969, 1981],
  ["1969/1981", 1969, 1981],
  ["1704, 1708", 1704, 1708],
  ["[about 1770s]", 1770, 1779],
  ["1575; 1577", 1575, 1577],
  ["A.D. 2nd–7th century", 101, 700],
  ["1860's", 1860, 1869],
  ["ca. 2381–2323 B.C. probably", -2383, -2322],
  ["ca. 1814–1805 B.C. suggested", -1816, -1804],
  ["ca. 1802–1640 B.C. check", -1804, -1639],
  ["ca. 1700–1500 B.C. (Middle Bronze Age IIB-IIC)", -1702, -1499],
];

const OPTIONED_METROPOLITAN_TEST_CASES: Array<
  [string, number, number, Partial<EpochizeOptions>]
> = [
  [
    "ca. 1184–1153 BC",
    -1183,
    -1152,
    { circaStartOffset: 0, circaEndOffset: 0 },
  ],
  [
    "ca. 35,000–5000 B.C.",
    -34999,
    -4999,
    { circaStartOffset: 0, circaEndOffset: 0 },
  ],
  [
    "ca. 1961–1917 B.C. or later",
    -1960,
    -1916,
    { circaStartOffset: 0, circaEndOffset: 0, afterOffset: 0 },
  ],
  ["ca. 1770", 1765, 1775, { circaStartOffset: 5, circaEndOffset: 5 }],
  ["ca. 1846", 1844, 1850, { circaStartOffset: 2, circaEndOffset: 4 }],
  ["ca. 1860–66", 1860, 1866, { circaStartOffset: 0, circaEndOffset: 0 }],
  ["dated ca. 1942", 1932, 1952, { circaStartOffset: 10, circaEndOffset: 10 }],
];

describe("Metropolitan Museum Dataset", () => {
  it.each(METROPOLITAN_TEST_CASES)(
    "should epochize %s",
    (input, start, end) => {
      const result = epochize(input, formalOptions);
      expect(result).not.toBeNull();
      const [epochStart, epochEnd] = result!;
      expect(epochStart.getFullYear()).toBe(start);
      expect(epochEnd.getFullYear()).toBe(end);
    }
  );

  it.each(OPTIONED_METROPOLITAN_TEST_CASES)(
    "should epochize %s with options",
    (input, start, end, options) => {
      const result = epochize(input, { ...formalOptions, ...options });
      expect(result).not.toBeNull();
      const [epochStart, epochEnd] = result!;
      expect(epochStart.getFullYear()).toBe(start);
      expect(epochEnd.getFullYear()).toBe(end);
    }
  );
});
