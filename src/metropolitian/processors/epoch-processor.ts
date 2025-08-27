import { epochize } from "../../lib/index";

export interface ProcessResult {
  status: 'success' | 'null' | 'error';
  objectDate: string;
  epochStart?: Date;
  epochEnd?: Date;
  metadata?: unknown;
  error?: string;
}

export class EpochProcessor {
  processObjectDate(objectDate: string): ProcessResult {
    try {
      const result = epochize(objectDate);
      
      if (result === null) {
        return {
          status: 'null',
          objectDate,
        };
      }
      
      const [epochStart, epochEnd, metadata] = result;
      return {
        status: 'success',
        objectDate,
        epochStart,
        epochEnd,
        metadata,
      };
    } catch (error) {
      return {
        status: 'error',
        objectDate,
        error: (error as Error).message,
      };
    }
  }
}