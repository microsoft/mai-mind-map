// $: Constructor type
// v: the value
export type Maybe<T> = { $: "Nothing" } | { $: "Just", v: T };

export const nothing = <T>(): Maybe<T> => ({ $: "Nothing" });
export const just = <T>(v: T): Maybe<T> => ({ $: "Just", v });
