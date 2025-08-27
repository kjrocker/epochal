import * as fs from "fs";
import * as path from "path";
import { stringify } from "csv-stringify/sync";
import { ProcessedResult } from "./csv-processor";

export interface RunMetrics {
  timestamp: string;
  exactPassed: number;
  approximatePassed: number;
  totalPassed: number;
  failed: number;
  nullResults: number;
  totalProcessed: number;
  passRate: string;
  exactPassRate: string;
  approximatePassRate: string;
  duration: number;
}

export class ResultWriter {
  private exactPassingResults: (string | number)[][] = [];
  private approximatePassingResults: (string | number)[][] = [];
  private failingResults: (string | number)[][] = [];
  private nullResults: (string | number)[][] = [];

  constructor(private outputDir: string) {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  }

  writeResult(result: ProcessedResult): void {
    const row = [
      result.objectDate,
      result.expectedBegin,
      result.expectedEnd,
      result.epochStart?.getFullYear() || "",
      result.epochEnd?.getFullYear() || "",
    ];

    if (result.status === 'null') {
      this.nullResults.push([...row, "epochize returned null"]);
    } else if (result.status === 'error') {
      this.failingResults.push([...row, `Error: ${result.error}`]);
    } else if (result.validationResult === 'exact') {
      this.exactPassingResults.push([...row, "EXACT MATCH"]);
    } else if (result.validationResult === 'approximate') {
      this.approximatePassingResults.push([...row, "APPROXIMATE MATCH"]);
    } else {
      const message = `Expected: ${result.expectedBegin}-${result.expectedEnd}, Got: ${result.epochStart?.getFullYear()}-${result.epochEnd?.getFullYear()}`;
      this.failingResults.push([...row, message]);
    }
  }

  writeAllResults(): void {
    const headers = [
      "Object Date",
      "Expected Begin", 
      "Expected End",
      "Epochized Begin",
      "Epochized End",
      "Status"
    ];

    // Combine exact and approximate for the overall passing results
    const allPassingResults = [
      ...this.exactPassingResults,
      ...this.approximatePassingResults
    ];

    this.writeCSV("passing_results.csv", headers, allPassingResults);
    this.writeCSV("exact_passing_results.csv", headers, this.exactPassingResults);
    this.writeCSV("approximate_passing_results.csv", headers, this.approximatePassingResults);
    this.writeCSV("failing_results.csv", headers, this.failingResults);
    this.writeCSV("null_results.csv", headers, this.nullResults);
  }

  appendAnalytics(metrics: RunMetrics): void {
    const analyticsPath = path.join(this.outputDir, "analytics.csv");
    const analyticsExists = fs.existsSync(analyticsPath);

    const analyticsRow = [
      metrics.timestamp,
      metrics.exactPassed,
      metrics.approximatePassed,
      metrics.totalPassed,
      metrics.failed,
      metrics.totalProcessed,
      metrics.exactPassRate,
      metrics.approximatePassRate,
      metrics.passRate,
      metrics.duration,
    ];

    const headers = [
      "Timestamp",
      "Exact Passed",
      "Approximate Passed",
      "Total Passed",
      "Failed", 
      "Total Processed",
      "Exact Pass Rate (%)",
      "Approximate Pass Rate (%)",
      "Overall Pass Rate (%)",
      "Duration (seconds)",
    ];

    if (!analyticsExists) {
      // Create new analytics file
      this.writeCSV("analytics.csv", headers, [analyticsRow]);
    } else {
      // Append to existing analytics file
      const analyticsContent = fs.readFileSync(analyticsPath, "utf-8");
      const existingData = this.parseCSV(analyticsContent);
      
      // Handle both old and new format analytics
      const allRows: (string | number)[][] = existingData.map((row) => {
        // Check if this is old format (fewer columns)
        if ("Exact Passed" in row) {
          // New format
          return [
            row["Timestamp"],
            Number(row["Exact Passed"]),
            Number(row["Approximate Passed"]),
            Number(row["Total Passed"]),
            Number(row["Failed"]),
            Number(row["Total Processed"]),
            row["Exact Pass Rate (%)"],
            row["Approximate Pass Rate (%)"],
            row["Overall Pass Rate (%)"],
            Number(row["Duration (seconds)"]),
          ];
        } else {
          // Old format - migrate
          return [
            row["Timestamp"],
            0, // Exact passed (unknown in old format)
            Number(row["Passed"]), // Treat all old passes as approximate
            Number(row["Passed"]),
            Number(row["Failed"]),
            Number(row["Total Processed"]),
            "0.00", // Exact pass rate (unknown)
            row["Pass Rate (%)"], // Approximate pass rate
            row["Pass Rate (%)"], // Overall pass rate
            Number(row["Duration (seconds)"]),
          ];
        }
      });
      allRows.push(analyticsRow);

      this.writeCSV("analytics.csv", headers, allRows);
    }
  }

  getMetrics(): RunMetrics {
    const exactPassed = this.exactPassingResults.length;
    const approximatePassed = this.approximatePassingResults.length;
    const totalPassed = exactPassed + approximatePassed;
    const failed = this.failingResults.length + this.nullResults.length;
    const totalProcessed = totalPassed + failed;
    
    const exactPassRate = totalProcessed > 0 ? ((exactPassed / totalProcessed) * 100).toFixed(2) : "0";
    const approximatePassRate = totalProcessed > 0 ? ((approximatePassed / totalProcessed) * 100).toFixed(2) : "0";
    const passRate = totalProcessed > 0 ? ((totalPassed / totalProcessed) * 100).toFixed(2) : "0";

    return {
      timestamp: new Date().toISOString(),
      exactPassed,
      approximatePassed,
      totalPassed,
      failed,
      nullResults: this.nullResults.length,
      totalProcessed,
      exactPassRate,
      approximatePassRate,
      passRate,
      duration: 0, // Will be set by caller
    };
  }

  private writeCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
    const csvContent = stringify(rows, {
      header: true,
      columns: headers,
    });
    fs.writeFileSync(path.join(this.outputDir, filename), csvContent);
  }

  private parseCSV(csvContent: string): Array<{ [key: string]: string }> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { parse } = require("csv-parse/sync");
    return parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  }
}