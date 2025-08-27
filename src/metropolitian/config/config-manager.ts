import * as path from "path";
import { ToleranceConfig } from "../processors/result-validator";

export interface ProcessingConfig {
  inputPath: string;
  outputDir: string;
  blocklistPaths: string[];
  tolerances: ToleranceConfig;
}

export class ConfigManager {
  static load(baseDir: string = __dirname): ProcessingConfig {
    // Default paths relative to the script location
    // If called from process_metropolitan.ts, baseDir is the metropolitian directory
    const metropolitanDir = baseDir;

    return {
      inputPath: path.join(metropolitanDir, "data/object_dates.csv"),
      outputDir: path.join(metropolitanDir, "results"),
      blocklistPaths: [
        path.join(metropolitanDir, "data/blocklist.csv"),
        path.join(metropolitanDir, "data/bad-data-blocklist.csv"),
      ],
      tolerances: {
        century: 10,
        earlyLate: 20,
        circa: 50,
      },
    };
  }
}
