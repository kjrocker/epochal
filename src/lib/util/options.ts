export interface EpochizeOptions {
  centuryShorthand: boolean;
  centuryBreakpoint: number;
  circaStartOffset: number;
  circaEndOffset: number;
  afterOffset: number;
}

export const DEFAULT_OPTIONS: EpochizeOptions = {
  centuryShorthand: false,
  centuryBreakpoint: 29,
  circaStartOffset: 3,
  circaEndOffset: 0,
  afterOffset: 10,
};

export const getOptions = (
  options?: Partial<EpochizeOptions>
): EpochizeOptions => {
  return { ...DEFAULT_OPTIONS, ...(options ?? {}) };
};
