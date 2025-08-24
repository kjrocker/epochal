# The Modifier Problem

This document is a problem statement articulating one of the weaker patterns in the codebase, and brainstorming how we can address it.

## The Problem

Modifiers such as "circa", "after", "early", "first half of", etc. end up creating a lot of special logic that is applied outside the normal handler chain. Most of these are actually handler dependent as well (early behaves differently for centuries than for years, circa should not apply to months).

This logic ends up being very imperative/procedural, and it's a huge mess.

## One Possible Solution

We _could_ create a class that would go inside of, or wrap around, the `Maybe` container we're already using. This would contain the transformation.

For example, the millenium logic would be extended from the current chain of basic, "un-modified" handlers:

```ts
export const handleMillenium: InputHandler = (input: string) => {
  return Maybe.fromValue(input)
    .map(milleniumToOrdinal)
    .map(milleniumToDate)
    .map((date): [Date, Date] => [startOfMillenium(date), endOfMillenium(date)])
    .map(attachMetadata(Handler.MILLENNIUM));
};
```

To something like this
```ts
export const handleMillenium: InputHandler = (input: string) => {
  return input
    .tryEach(
        text => modify<string, [Date, Date]>(text, (text: string): boolean => textHasModifier(text), (dates: [Date, Date]) => transformDatesWithModifier(dates))
    )
    .map(milleniumToOrdinal)
    .map(milleniumToDate)
    .map((date): [Date, Date] => [startOfMillenium(date), endOfMillenium(date)])
    .unwrap()
    .map(attachMetadata(Handler.MILLENNIUM));
};
```

The responsibilities of the 'Modifier' class would include:
1. Taking a filter function that checks 'does this modifier apply'
2. A map (and flatMap) function that passes along the value _without_ the modifier
    - An implicit requirement is some kind of 'removal' function
3. An unwrap function that applies the stored "final" transformation once other operations have occurred
4. It should continue to support the `Maybe` behavior where a null value causes the entire chain to fall apart.