import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

// Import the epochize function directly from TypeScript source
// NOTE: Always use epochize(), not epochizeInner() - epochize is the public API
import { epochize } from "../index";
import { Handler } from "../util/util";

// Regex patterns to automatically blocklist persistent problematic patterns
// Add patterns here for dates that consistently fail and should be ignored
const REGEX_BLOCKLIST: RegExp[] = [
  // Example patterns - customize as needed:
  /blade/,
  /modeled/,
];

interface CSVRow {
  [key: string]: string;
}

// Parse CSV using csv-parse library
function parseCSV(csvContent: string): CSVRow[] {
  return parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

// Write CSV using csv-stringify library
function writeCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const csvContent = stringify(rows, {
    header: true,
    columns: headers,
  });
  fs.writeFileSync(filename, csvContent);
}

// Load existing blocklist from CSV (if it exists)
function loadBlocklistFromFile(
  filePath: string,
  description: string
): Set<string> {
  const blocklistSet = new Set<string>();

  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const data = parseCSV(content);

      data.forEach((row) => {
        if (row["Object Date"]) {
          blocklistSet.add(row["Object Date"]);
        }
      });

      console.log(
        `Loaded ${blocklistSet.size} items from existing ${description}`
      );
    } catch (error) {
      console.log(`No existing ${description} found, starting fresh`);
    }
  }

  return blocklistSet;
}

// Check if objectDate matches any regex blocklist patterns
function isRegexBlocked(objectDate: string): boolean {
  return REGEX_BLOCKLIST.some((pattern) => pattern.test(objectDate));
}

const isResultPassing = (
  row: CSVRow,
  result: NonNullable<ReturnType<typeof epochize>>
): boolean => {
  const [epochStart, epochEnd, metadata] = result;
  const epochStartYear = epochStart.getFullYear();
  const epochEndYear = epochEnd.getFullYear();
  const beginDate = parseInt(row["Object Begin Date"]);
  const endDate = parseInt(row["Object End Date"]);

  // Check for exact match first
  if (epochStartYear === beginDate && epochEndYear === endDate) {
    return true;
  }

  const isCenturyOrMillennium = metadata.handler.some(
    (h) => h === Handler.CENTURY || h === Handler.MILLENNIUM
  );
  if (isCenturyOrMillennium) {
    const startDiff = Math.abs(epochStartYear - beginDate);
    const endDiff = Math.abs(epochEndYear - endDate);
    return startDiff <= 1 && endDiff <= 1;
  }

  return false;
};

function main(): void {
  const startTime = new Date();
  console.log("Processing Metropolitan Museum object dates...");

  // Read the CSV file
  const csvPath = path.join(__dirname, "object_dates.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const data = parseCSV(csvContent);

  console.log(`Loaded ${data.length} records from CSV`);

  // Load existing blocklists
  const blocklistPath = path.join(__dirname, "blocklist.csv");
  const badDataBlocklistPath = path.join(__dirname, "bad-data-blocklist.csv");
  const existingBlocklist = loadBlocklistFromFile(blocklistPath, "blocklist");
  const existingBadDataBlocklist = loadBlocklistFromFile(
    badDataBlocklistPath,
    "bad-data blocklist"
  );

  const passing: (string | number)[][] = [];
  const failing: (string | number)[][] = [];

  data.forEach((row) => {
    const objectDate = row["Object Date"];
    const beginDate = parseInt(row["Object Begin Date"]);
    const endDate = parseInt(row["Object End Date"]);

    // Check if this date is in the existing blocklists or matches regex patterns
    if (
      existingBlocklist.has(objectDate) ||
      existingBadDataBlocklist.has(objectDate) ||
      isRegexBlocked(objectDate)
    ) {
      return;
    }

    try {
      // Process with epochize (public API)
      const result = epochize(objectDate);

      if (result === null) {
        failing.push([
          objectDate,
          beginDate,
          endDate,
          "",
          "",
          "epochize returned null",
        ]);
        return;
      }

      const [epochStart, epochEnd] = result;

      // Check if the epochized years match the expected years
      if (isResultPassing(row, result)) {
        passing.push([
          objectDate,
          beginDate,
          endDate,
          epochStart.getFullYear(),
          epochEnd.getFullYear(),
          "PASS",
        ]);
      } else {
        failing.push([
          objectDate,
          beginDate,
          endDate,
          epochStart.getFullYear(),
          epochEnd.getFullYear(),
          `Expected: ${beginDate}-${endDate}, Got: ${epochStart.getFullYear()}-${epochEnd.getFullYear()}`,
        ]);
      }
    } catch (error) {
      failing.push([
        objectDate,
        beginDate,
        endDate,
        "",
        "",
        "Error: " + (error as Error).message,
      ]);
    }
  });

  const endTime = new Date();
  const totalProcessed = passing.length + failing.length;
  const passRate =
    totalProcessed > 0
      ? ((passing.length / totalProcessed) * 100).toFixed(2)
      : "0";

  console.log(`\nResults:`);
  console.log(`- Passing: ${passing.length}`);
  console.log(`- Failing: ${failing.length}`);
  console.log(`- Pass rate: ${passRate}%`);

  // Write analytics to CSV
  const analyticsPath = path.join(__dirname, "analytics.csv");
  const analyticsExists = fs.existsSync(analyticsPath);

  const analyticsRow = [
    endTime.toISOString(),
    passing.length,
    failing.length,
    totalProcessed,
    passRate,
    (endTime.getTime() - startTime.getTime()) / 1000, // duration in seconds
  ];

  if (!analyticsExists) {
    // Create new analytics file with headers
    writeCSV(
      analyticsPath,
      [
        "Timestamp",
        "Passed",
        "Failed",
        "Total Processed",
        "Pass Rate (%)",
        "Duration (seconds)",
      ],
      [analyticsRow]
    );
  } else {
    // Append to existing analytics file
    const analyticsContent = fs.readFileSync(analyticsPath, "utf-8");
    const existingAnalytics = parseCSV(analyticsContent);
    const allRows: (string | number)[][] = existingAnalytics.map((row) => [
      row["Timestamp"],
      Number(row["Passed"]),
      Number(row["Failed"]),
      Number(row["Total Processed"]),
      row["Pass Rate (%)"],
      Number(row["Duration (seconds)"]),
    ]);
    allRows.push(analyticsRow);

    writeCSV(
      analyticsPath,
      [
        "Timestamp",
        "Passed",
        "Failed",
        "Total Processed",
        "Pass Rate (%)",
        "Duration (seconds)",
      ],
      allRows
    );
  }

  // Write the results to CSV files
  const outputDir = __dirname;

  writeCSV(
    path.join(outputDir, "passing_results.csv"),
    [
      "Object Date",
      "Expected Begin",
      "Expected End",
      "Epochized Begin",
      "Epochized End",
      "Status",
    ],
    passing
  );

  writeCSV(
    path.join(outputDir, "failing_results.csv"),
    [
      "Object Date",
      "Expected Begin",
      "Expected End",
      "Epochized Begin",
      "Epochized End",
      "Error",
    ],
    failing
  );

  console.log("\nProcessing complete!");
}

if (require.main === module) {
  main();
}
