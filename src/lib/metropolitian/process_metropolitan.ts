import * as fs from "fs";
import * as path from "path";

// Import the epochize function directly from TypeScript source
import { epochize } from "../index";

interface CSVRow {
  [key: string]: string;
}

interface CSVData extends Array<CSVRow> {
  headers?: string[];
}

// Proper CSV parsing that handles quoted commas
function parseCSV(csvContent: string): CSVData {
  const lines = csvContent.trim().split("\n");
  const data: CSVData = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const row: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === '"' && (j === 0 || line[j - 1] !== "\\")) {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        row.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    row.push(current.trim());

    if (i === 0) {
      data.headers = row;
    } else {
      const rowObj: CSVRow = {};
      data.headers!.forEach((header, index) => {
        rowObj[header] = row[index] || "";
      });
      data.push(rowObj);
    }
  }

  return data;
}

// CSV writing helper that properly quotes fields containing commas
function writeCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const escapeField = (field: string | number): string => {
    const str = String(field);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeField).join(","),
    ...rows.map((row) => row.map(escapeField).join(",")),
  ].join("\n");

  fs.writeFileSync(filename, csvContent);
}

// Load existing blocklist from CSV (if it exists)
function loadBlocklist(blocklistPath: string): Set<string> {
  const blocklistSet = new Set<string>();

  if (fs.existsSync(blocklistPath)) {
    try {
      const blocklistContent = fs.readFileSync(blocklistPath, "utf-8");
      const blocklistData = parseCSV(blocklistContent);

      blocklistData.forEach((row) => {
        if (row["Object Date"]) {
          blocklistSet.add(row["Object Date"]);
        }
      });

      console.log(`Loaded ${blocklistSet.size} items from existing blocklist`);
    } catch (error) {
      console.log("No existing blocklist found, starting fresh");
    }
  }

  return blocklistSet;
}

// Load existing bad-data blocklist from CSV (if it exists)
function loadBadDataBlocklist(badDataBlocklistPath: string): Set<string> {
  const badDataBlocklistSet = new Set<string>();

  if (fs.existsSync(badDataBlocklistPath)) {
    try {
      const badDataContent = fs.readFileSync(badDataBlocklistPath, "utf-8");
      const badDataData = parseCSV(badDataContent);

      badDataData.forEach((row) => {
        if (row["Object Date"]) {
          badDataBlocklistSet.add(row["Object Date"]);
        }
      });

      console.log(
        `Loaded ${badDataBlocklistSet.size} items from existing bad-data blocklist`
      );
    } catch (error) {
      console.log("No existing bad-data blocklist found, starting fresh");
    }
  }

  return badDataBlocklistSet;
}

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
  const existingBlocklist = loadBlocklist(blocklistPath);
  const existingBadDataBlocklist = loadBadDataBlocklist(badDataBlocklistPath);

  const passing: (string | number)[][] = [];
  const failing: (string | number)[][] = [];

  data.forEach((row, index) => {
    const objectDate = row["Object Date"];
    const beginDate = parseInt(row["Object Begin Date"]);
    const endDate = parseInt(row["Object End Date"]);

    // Check if this date is in the existing blocklists
    if (existingBlocklist.has(objectDate)) {
      return;
    }

    if (existingBadDataBlocklist.has(objectDate)) {
      return;
    }

    try {
      // Process with epochize
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
      const epochStartYear = epochStart.getFullYear();
      const epochEndYear = epochEnd.getFullYear();

      // Check if the epochized years match the expected years
      if (epochStartYear === beginDate && epochEndYear === endDate) {
        passing.push([
          objectDate,
          beginDate,
          endDate,
          epochStartYear,
          epochEndYear,
          "PASS",
        ]);
      } else {
        failing.push([
          objectDate,
          beginDate,
          endDate,
          epochStartYear,
          epochEndYear,
          `Expected: ${beginDate}-${endDate}, Got: ${epochStartYear}-${epochEndYear}`,
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
