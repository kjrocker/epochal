import { epochize } from ".";
import { attachMetadata, InputHandler } from "./util/util";

const matchTo = (input: string): [string, string] | null => {
    const matches = input.split('to')
    if (matches.length !== 2) return null;
    return matches as [string, string];
}

const handleSplitStrings = ([first, second]: [string, string]): [Date, Date] | null => {
    const start = epochize(first)
    const end = epochize(second)
    if ( start === null || end === null) return null;
    return [start[0], end[1]]
}

export const handleRange: InputHandler = input => {
    return input.map(matchTo).map(handleSplitStrings)
        .map(attachMetadata("handleRange", input.getOrElse("")));
   
}