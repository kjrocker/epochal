import { islamicModifier } from "./islamic";

describe("printedModifer", () => {
  const modifier = islamicModifier();
  const { predicate, extractor } = modifier;

  test.each([
    ["dated A.H. 199/799", "799"],
    ["A.H. 199/799", "799"],
    ["dated A.H. 369/ 979 CE", "979 ce"],
    ["dated A.H. 37?/ 98 CE ?", "98 ce ?"],
    ["dated A.H. 372?/ 982 CE ?", "982 ce ?"],
    ["dated A.H. 355/ A.H. 966", "a.h. 966"],
    ["dated A.H. 374?/ 984 CE ?", "984 ce ?"],
    ["dated A.H. 36?/ 97 CE ?", "97 ce ?"],
    ["dated A.H. 363?/ 973 CE ?", "973 ce ?"],
    ["dated A.H. 367 or 369/ 977 or 979 CE", "977 or 979 ce"],
    ["dated A.H. 3?/ 9 CE ?", "9 ce ?"],
    ["A.H. ?4/ 4 CE ?", "4 ce ?"],
    ["A.H. 141–50/ 758–68 CE", "758–68 ce"],
    ["A.H. 366–87/ 976–97 CE", "976–97 ce"],
    ["A.H. 160–63/ 776–79 CE", "776–79 ce"],
    ["A.H. 422–67/ 1030–74 CE", "1030–74 ce"],
    ["dated: A.H. 137/ 754 CE", "754 ce"],
    ["probably A.H. 158–70/ 763–86 CE", "763–86 ce"],
    ["A.H. 204 / 820 CE", "820 ce"],
    ["A.H. 139–48/ 757–66 CE", "757–66 ce"],
    ["A.H. 101–201/719–816 CE", "719–816 ce"],
    ["A.H. 716–36/ 1316–35 CE", "1316–35 ce"],
    ["A.H. 158–69/ 774–85 CE", "774–85 ce"],
    ["probably A.H. 759–76/ 1357–74 CE", "1357–74 ce"],
    ["A.H. 130–36/ 747–53 CE", "747–53 ce"],
    ["probably A.H. 170–93/ 786–808 CE", "786–808 ce"],
    ["A.H. 198–204/ 813–19 CE", "813–19 ce"],
    ["A.H. 159–60/ 775–76 CE", "775–76 ce"],
    ["A.H. 387–89/997–98 CE", "997–98 ce"],
    ["A.H. 169–70/ 785–86 CE", "785–86 ce"],
    ["A.H. 170–93/ 786–808 CE", "786–808 ce"],
    ["A.H. 158–68/ 774–84 CE", "774–84 ce"],
    ["A.H. 177–87/ 793–802 CE", "793–802 ce"],
    ["A.H. 170–177/ 786–93 CE", "786–93 ce"],
    ["677 CE/58 A.H.", "677 ce"],
    ["777–778 CE/161 A.H.", "777–778 ce"],
    ["691–692 CE (?)/72 A.H. (?)", "691–692 ce (?)"],
  ])(
    "predicate accepts and extractor processes '%s' -> '%s'",
    (input, expected) => {
      expect(predicate(input.toLowerCase().trim())).toBe(true);
      expect(extractor(input.toLowerCase().trim())).toBe(expected);
    }
  );

  test.each([
    "1919 printed 1928", // no comma
    "1850 printing house", // different word
    "Renaissance printed work", // no comma
  ])("predicate rejects '%s'", (input) => {
    expect(predicate(input)).toBe(false);
  });
});
