import { pipeline } from 'stream/promises';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { Transform } from 'stream';
import { EpochProcessor, ProcessResult } from '../processors/epoch-processor';
import { ResultValidator, CSVRow, ValidationResult } from '../processors/result-validator';
import { BlocklistManager } from '../processors/blocklist-manager';
import { ResultWriter } from './result-writer';

export interface ProcessedResult extends ProcessResult {
  validationResult: ValidationResult;
  expectedBegin: number;
  expectedEnd: number;
}

export class CSVProcessor {
  constructor(
    private processor: EpochProcessor,
    private validator: ResultValidator,
    private blocklists: BlocklistManager,
    private resultWriter: ResultWriter
  ) {}

  async processFile(inputPath: string): Promise<void> {
    const processingStream = new Transform({
      objectMode: true,
      transform: (row: CSVRow, _encoding, callback) => {
        try {
          const objectDate = row['Object Date'];
          
          // Skip blocked items
          if (this.blocklists.isBlocked(objectDate)) {
            return callback();
          }

          const processResult = this.processor.processObjectDate(objectDate);
          const validationResult = this.validator.validateResult(row, processResult);
          
          const result: ProcessedResult = {
            ...processResult,
            validationResult,
            expectedBegin: parseInt(row['Object Begin Date']),
            expectedEnd: parseInt(row['Object End Date']),
          };
          
          this.resultWriter.writeResult(result);
          callback();
        } catch (error) {
          callback(error as Error);
        }
      }
    });

    await pipeline(
      createReadStream(inputPath),
      parse({ columns: true, skip_empty_lines: true, trim: true }),
      processingStream
    );
  }
}