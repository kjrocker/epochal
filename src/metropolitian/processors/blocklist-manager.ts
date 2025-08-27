import * as fs from "fs";
import { parse } from "csv-parse/sync";

export class BlocklistManager {
  private blocklistSet = new Set<string>();
  private regexBlocklist: RegExp[] = [
    /blade/,
    /modeled/,
  ];

  constructor(private blocklistPaths: string[]) {}

  async loadAll(): Promise<void> {
    for (const filePath of this.blocklistPaths) {
      this.loadBlocklistFromFile(filePath);
    }
  }

  private loadBlocklistFromFile(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      console.log(`Blocklist file not found: ${filePath}`);
      return;
    }

    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const data = this.parseCSV(content);

      let loadedCount = 0;
      data.forEach((row) => {
        if (row["Object Date"]) {
          this.blocklistSet.add(row["Object Date"]);
          loadedCount++;
        }
      });

      console.log(`Loaded ${loadedCount} items from ${filePath}`);
    } catch (error) {
      console.log(`Error loading blocklist from ${filePath}: ${(error as Error).message}`);
    }
  }

  private parseCSV(csvContent: string): Array<{ [key: string]: string }> {
    return parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  }

  isBlocked(objectDate: string): boolean {
    // Check explicit blocklist
    if (this.blocklistSet.has(objectDate)) {
      return true;
    }

    // Check regex patterns
    return this.regexBlocklist.some((pattern) => pattern.test(objectDate));
  }

  addToBlocklist(objectDate: string): void {
    this.blocklistSet.add(objectDate);
  }

  getBlockedCount(): number {
    return this.blocklistSet.size;
  }
}