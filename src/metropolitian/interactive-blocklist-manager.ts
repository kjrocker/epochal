#!/usr/bin/env ts-node

import { createReadStream, appendFileSync } from "fs";
import { parse } from "csv-parse";
import * as readline from "readline";
import * as path from "path";

// Configuration constants - using absolute paths relative to this script
const SCRIPT_DIR = path.dirname(__filename);
const INPUT_CSV_FILE = path.join(SCRIPT_DIR, "results/null_results.csv");
const BLOCKLIST_CSV = path.join(SCRIPT_DIR, "data/blocklist.csv");
const BAD_DATA_BLOCKLIST_CSV = path.join(SCRIPT_DIR, "data/bad-data-blocklist.csv");

interface ObjectDateRecord {
  "Object Date": string;
  "Object Begin Date": string;
  "Object End Date": string;
}

class InteractiveBlocklistManager {
  private rl: readline.Interface;
  private processedCount = 0;
  private appendedCount = 0;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    // Set up raw mode for single keypress detection
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
  }

  async run(): Promise<void> {
    console.log("Interactive Blocklist Manager");
    console.log("============================");
    console.log(`Input file: ${INPUT_CSV_FILE}`);
    console.log(`Blocklist files: ${BLOCKLIST_CSV}, ${BAD_DATA_BLOCKLIST_CSV}`);
    console.log("\nInstructions:");
    console.log("- Press Enter or any other key to skip");
    console.log('- Press "u" for general blocklist');
    console.log('- Press "h" for bad-data blocklist');
    console.log('- Press "q" to quit');
    console.log("\n");

    // First, read all records into memory
    const records = await this.readAllRecords();
    
    // Then process them sequentially
    for (const record of records) {
      this.processedCount++;
      const objectDate = record["Object Date"];

      if (!objectDate || objectDate.trim() === "") {
        continue;
      }

      try {
        const action = await this.promptUser(objectDate);

        if (action === "q" || action === "quit") {
          console.log("\nQuitting...");
          break;
        }

        if (action === "u") {
          this.appendToBlocklist(BLOCKLIST_CSV, objectDate);
          console.log(`✓ Added "${objectDate}" to general blocklist`);
          this.appendedCount++;
        } else if (action === "h") {
          this.appendToBlocklist(BAD_DATA_BLOCKLIST_CSV, objectDate);
          console.log(`✓ Added "${objectDate}" to bad-data blocklist`);
          this.appendedCount++;
        }
        // For Enter or any other input, just skip (no action needed)
      } catch (error) {
        console.error(`Error processing record: ${error}`);
      }
    }

    console.log("\n============================");
    console.log(`Finished processing ${this.processedCount} records`);
    console.log(`Appended ${this.appendedCount} entries to blocklists`);
    this.cleanup();
  }

  private async readAllRecords(): Promise<ObjectDateRecord[]> {
    return new Promise((resolve, reject) => {
      const records: ObjectDateRecord[] = [];
      const stream = createReadStream(INPUT_CSV_FILE);
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
      });

      stream.pipe(parser);

      parser.on("data", (record: ObjectDateRecord) => {
        records.push(record);
      });

      parser.on("end", () => {
        resolve(records);
      });

      parser.on("error", (error) => {
        reject(error);
      });
    });
  }

  private async promptUser(objectDate: string): Promise<string> {
    return new Promise((resolve) => {
      process.stdout.write(`[${this.processedCount}] "${objectDate}" - Press u/h/q or any other key to skip: `);
      
      const onData = (buffer: Buffer) => {
        const input = buffer.toString('utf8');
        const key = input.toLowerCase();
        
        // Handle special keys
        if (input === '\r' || input === '\n') {
          // Enter key - skip
          console.log('(skip)');
          process.stdin.off('data', onData);
          resolve('skip');
        } else if (key === 'u' || key === 'h' || key === 'q') {
          console.log(key);
          process.stdin.off('data', onData);
          resolve(key);
        } else {
          // Any other key - skip
          console.log('(skip)');
          process.stdin.off('data', onData);
          resolve('skip');
        }
      };
      
      process.stdin.on('data', onData);
    });
  }

  private appendToBlocklist(filename: string, value: string): void {
    try {
      appendFileSync(filename, `\n"${value}"`);
    } catch (error) {
      console.error(`Error appending to ${filename}: ${error}`);
    }
  }

  private cleanup(): void {
    // Restore normal terminal mode
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    this.rl.close();
  }
}

// Main execution
async function main() {
  const manager = new InteractiveBlocklistManager();
  try {
    await manager.run();
    console.log("Interactive blocklist management completed.");
  } catch (error) {
    console.error("Error running interactive blocklist manager:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
