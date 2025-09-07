# CLAUDE.md - Metropolitan Museum Analytics Script

This document provides guidance for working with the Metropolitan Museum of Art dataset processing and analytics system.

## Overview

The metropolitian module is a comprehensive data processing pipeline that validates the `epochize` function against real-world museum date data from the Metropolitan Museum of Art. It processes historical date strings from the museum's collection and compares the results against expected date ranges to measure accuracy and performance.

## Architecture

### Main Entry Point
- **`main.ts`** - Primary orchestration script that coordinates all processing components
- Run with: `npm run process:metropolitan`

### Core Components

#### Configuration
- **`config/config-manager.ts`** - Centralized configuration management
  - Input/output paths
  - Tolerance settings for validation
  - Blocklist file paths

#### Data Processing
- **`processors/epoch-processor.ts`** - Handles `epochize` function calls and error handling
- **`processors/result-validator.ts`** - Validates epochized results against expected ranges with configurable tolerances
- **`processors/blocklist-manager.ts`** - Manages data filtering using blocklist files

#### I/O Operations
- **`io/csv-processor.ts`** - Streams CSV data processing for memory efficiency
- **`io/result-writer.ts`** - Handles output file generation and analytics collection

### Data Files

#### Input Data
- **`data/object_dates.csv`** - Primary dataset from Metropolitan Museum (32,000+ records)
- **`data/blocklist.csv`** - General data exclusions
- **`data/bad-data-blocklist.csv`** - Specific bad data patterns to exclude

#### Output Files (Generated)
- **`results/analytics.csv`** - Historical run metrics and performance tracking
- **`results/passing_results.csv`** - All successful parsing results
- **`results/exact_passing_results.csv`** - Exact matches only
- **`results/approximate_passing_results.csv`** - Close matches within tolerance
- **`results/failing_results.csv`** - Failed parsing attempts with error details
- **`results/null_results.csv`** - Cases where epochize returned null

## Key Metrics

The system tracks comprehensive analytics including:
- **Exact Pass Rate**: Perfect matches between epochized and expected dates
- **Approximate Pass Rate**: Matches within configured tolerance ranges
- **Overall Pass Rate**: Combined exact and approximate success rate
- **Null Rate**: Percentage of inputs that returned null results
- **Processing Duration**: Time taken to process the entire dataset

Current performance (as of latest run):
- **Overall Pass Rate**: ~82.87%
- **Exact Pass Rate**: ~58.90% 
- **Approximate Pass Rate**: ~23.97%
- **Processing Time**: ~2.2 seconds for 32,736 records

## Validation Tolerances

Configurable tolerance settings in years for different date types:
- **Century**: ±10 years tolerance
- **Early/Late modifiers**: ±20 years tolerance  
- **Circa dates**: ±50 years tolerance

## Development Workflow

### Running the Analysis
```bash
npm run process:metropolitan
```

### Typical Output Structure
The script processes data and generates:
1. Console output with summary statistics
2. Multiple CSV files categorizing results
3. Updated analytics.csv with historical performance data

### Adding New Validation Rules
1. Modify tolerance settings in `config/config-manager.ts`
2. Update validation logic in `processors/result-validator.ts`
3. Run analysis to see impact on success rates

### Data Quality Management
- Add problematic patterns to blocklist files
- Review `failing_results.csv` to identify common failure modes
- Use `null_results.csv` to find inputs that need parser enhancements

## Performance Considerations

- **Memory Efficient**: Uses streaming CSV processing for large datasets
- **Blocklist Optimization**: Loads blocklists into memory upfront for fast filtering
- **Batch Processing**: Processes all records in a single run for efficiency
- **Progress Tracking**: Provides real-time feedback during processing

## Analytics History

The `analytics.csv` file maintains a complete history of all runs, enabling:
- Performance regression detection
- Impact analysis of code changes
- Long-term trend monitoring
- Benchmark comparisons

## Common Tasks

### Investigating Failures
1. Review `failing_results.csv` for patterns in failed parses
2. Check `null_results.csv` for inputs returning null
3. Cross-reference with blocklist files to understand exclusions

### Performance Analysis
1. Compare current run against historical data in `analytics.csv`
2. Monitor exact vs approximate pass rate trends
3. Track processing time improvements

### Data Quality Improvements
1. Identify common failure patterns
2. Add new entries to appropriate blocklist files  
3. Re-run analysis to measure improvement

## Dependencies

- **csv-parse**: For reading CSV input data
- **csv-stringify**: For generating output CSV files
- **date-fns**: Date manipulation (via main epochize function)
- **ts-node**: Direct TypeScript execution

## Error Handling

The system includes comprehensive error handling:
- Graceful handling of malformed dates
- Detailed error reporting in output files
- Process continuation even with individual record failures
- Comprehensive logging for debugging