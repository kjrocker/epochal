import { epochizeTuple } from ".";
import { Maybe } from "./util/maybe";
import { Tuple } from "./util/tuple";
import { attachMetadata } from "./util/util";

const thirdsOfRange = (input: Tuple<[Date, Date]>): [Date, Date, Date, Date] => {
    const [start, end] = input.get();
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
    return Maybe.fromValue(input).map((string) => matchEarly(string)).map((rest) => epochizeTuple(rest)).map((tuple) => {
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
    return Maybe.fromValue(input).map((string) => matchMiddle(string)).map((rest) => epochizeTuple(rest)).map((tuple) => {
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
    return Maybe.fromValue(input).map((string) => matchLate(string)).map((rest) => epochizeTuple(rest)).map((tuple) => {
        const [_first, _second, start, end] = thirdsOfRange(tuple);
        return [start, end];
    });
}

export const handlePartial = (
    input: Maybe<string>
): Maybe<Tuple<[Date, Date]>> => {
    return input.flatTryEach(handleEarly, handleMiddle, handleLate)
        .map(dates => attachMetadata("handlePartial", input.getOrElse(""))(dates));
};
