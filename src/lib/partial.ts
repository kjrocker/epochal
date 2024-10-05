import { epochizeInner } from ".";
import { Maybe } from "./util/maybe";
import { attachMetadata, InputHandler, Metadata } from "./util/util";

const thirdsOfRange = (input: [Date, Date, Metadata]): [Date, Date, Date, Date] => {
    const [start, end] = input;
    const diff = end.getTime() - start.getTime();
    const third = diff / 3;
    return [start, new Date(start.getTime() + third), new Date(start.getTime() + 2 * third), end];
}

const matchEarly = (input: string): string | null => {
    const matches = input.match(/(?<=early).*/)
    if (!matches || !matches[0]) return null;
    return matches[0];
}

const handleEarly = (input: string): Maybe<[Date, Date]> => {
    return Maybe.fromValue(input).map(matchEarly).flatMap(epochizeInner).map((tuple) => {
        const [start, end, _third, _fourth] = thirdsOfRange(tuple);
        return [start, end];
    });
}

const matchMiddle = (input: string): string | null => {
    const matches = input.match(/(?<=mid).*/)
    if (!matches || !matches[0]) return null;
    return matches[0];
}

const handleMiddle = (input: string): Maybe<[Date, Date]> => {
    return Maybe.fromValue(input).map(matchMiddle).flatMap(epochizeInner).map((tuple) => {
        const [_first, start, end, _fourth] = thirdsOfRange(tuple);
        return [start, end];
    });
}

const matchLate = (input: string): string | null => {
    const matches = input.match(/(?<=late).*/)
    if (!matches || !matches[0]) return null;
    return matches[0];
}

const handleLate = (input: string): Maybe<[Date, Date]> => {
    return Maybe.fromValue(input).map(matchLate).flatMap(epochizeInner).map((tuple) => {
        const [_first, _second, start, end] = thirdsOfRange(tuple);
        return [start, end];
    });
}

export const handlePartial: InputHandler = (
    input
) => {
    return input.flatTryEach(handleEarly, handleMiddle, handleLate)
        .map(attachMetadata("handlePartial", input.getOrElse("")));
};
