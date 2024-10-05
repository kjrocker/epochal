export interface EpochizeOptions {
    centuryShorthand: boolean;
    centuryBreakpoint: number;
}

export const DEFAULT_OPTIONS: EpochizeOptions = {
    centuryShorthand: false,
    centuryBreakpoint: 29
};

export const getOptions = (options?: Partial<EpochizeOptions>): EpochizeOptions => {
    return { ...DEFAULT_OPTIONS, ...(options ?? {}) };
}