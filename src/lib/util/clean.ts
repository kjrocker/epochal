export const clean = (str: string): string | null => {
  if (!str) return null;
  // Remove uncertainty markers like "(?) before cleaning
  let result = str.toLowerCase().replace(/\s*\(\?\)\s*/g, "");
  // Remove single trailing question marks
  result = result.replace(/\s*\?\s*$/, "");
  // Remove complete wrapping parentheses, brackets, or braces
  result = result.replace(/^\s*\(\s*(.*?)\s*\)\s*$/, "$1");
  result = result.replace(/^\s*\[\s*(.*?)\s*\]\s*$/, "$1");
  result = result.replace(/^\s*\{\s*(.*?)\s*\}\s*$/, "$1");
  // Replacing "mid-" with "mid " wherever it's found
  result = result.replace(/mid[-–—‒]/g, "mid ");
  const cleaned = result.trim().toLowerCase();
  if (!cleaned || cleaned === "") return null;
  // Reduce multiple whitespaces to single whitespace
  return cleaned.replace(/\s+/g, " ");
};