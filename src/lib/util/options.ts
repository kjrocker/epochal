export interface EpochizeOptions {
    shortYears: boolean;
}

export const DEFAULT_OPTIONS: EpochizeOptions = {
    shortYears: false,
};

export const getOptions = (options?: Partial<EpochizeOptions>): EpochizeOptions => {
    return { ...DEFAULT_OPTIONS, ...(options ?? {}) };
}