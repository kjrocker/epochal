// Import the refactored components
import { EpochProcessor } from "./processors/epoch-processor";
import { ResultValidator } from "./processors/result-validator";
import { BlocklistManager } from "./processors/blocklist-manager";
import { CSVProcessor } from "./io/csv-processor";
import { ResultWriter } from "./io/result-writer";
import { ConfigManager } from "./config/config-manager";

async function main(): Promise<void> {
  const startTime = Date.now();

  // Load configuration
  const config = ConfigManager.load(__dirname);

  // Load blocklists upfront (small files, keep in memory)
  const blocklists = new BlocklistManager(config.blocklistPaths);
  await blocklists.loadAll();

  // Create processing components
  const processor = new EpochProcessor();
  const validator = new ResultValidator(config.tolerances);
  const resultWriter = new ResultWriter(config.outputDir);

  // Stream process the main CSV file
  const csvProcessor = new CSVProcessor(
    processor,
    validator,
    blocklists,
    resultWriter
  );

  try {
    await csvProcessor.processFile(config.inputPath);

    const endTime = Date.now();

    // Get metrics and write all results
    const metrics = resultWriter.getMetrics();
    metrics.duration = (endTime - startTime) / 1000;

    console.log(`\nResults:`);
    console.log(`- Exact matches: ${metrics.exactPassed} (${metrics.exactPassRate}%)`);
    console.log(`- Approximate matches: ${metrics.approximatePassed} (${metrics.approximatePassRate}%)`);
    console.log(`- Total passing: ${metrics.totalPassed} (${metrics.passRate}%)`);
    console.log(`- Failing: ${metrics.failed}`);

    // Write all result files
    resultWriter.writeAllResults();
    resultWriter.appendAnalytics(metrics);

    console.log("\nProcessing complete!");
  } catch (error) {
    console.error("Error during processing:", (error as Error).message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
