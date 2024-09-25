declare const index: unique symbol;

// A type for representing type variables
type _<N extends number = 0> = { [index]: N };

// Type application (substitutes type variables with types)
type $<T, S, N extends number = 0> = T extends _<N>
  ? S
  : T extends undefined | null | boolean | string | number
    ? T
    : T extends Array<infer A>
      ? $Array<A, S, N>
      : T extends () => infer O
        ? () => $<O, S, N>
        : T extends (x: infer I) => infer O
          ? (x: $<I, S, N>) => $<O, S, N>
          : T extends object
            ? { [K in keyof T]: $<T[K], S, N> }
            : T;

interface $Array<T, S, N extends number> extends Array<$<T, S, N>> {}

type Construction<T> = {
  string: $<T, string>;
  number: $<T, number>;
  boolean: $<T, boolean>;
  array: <E>(elem: $<T, E>) => $<T, E[]>;
  record: <V>(value: $<T, V>) => $<T, Record<string, V>>;
  struct: <S extends Record<string, any>>(
    struct: {
      [K in keyof S]: $<T, S[K]>;
    },
  ) => $<T, S>;
};

// type Preset<T> = () => T;

// const presetWith = <T>(value: T): Preset<T> => () => value;

// const preset: Construction<Preset<_>> = {
//   string: presetWith(''),
//   number: presetWith(0),
//   boolean: presetWith(false),
//   array: () => presetWith([]),
//   record: () => presetWith({}),
//   struct: <S extends Record<string, any>>(struct: { [K in keyof S]: Preset<S[K]> }): Preset<S> =>
//     presetWith(
//       (Object.keys(struct) as (keyof S)[]).reduce((m, key) => {
//         m[key] = struct[key]();
//         return m;
//       }, {} as S),
//     ),
// };

// const con = <T>(t: Construction<T>) =>
//   t.struct({ foo: t.array(t.string), bar: t.number });

// const f = con(preset)();

// const u = preset.array(preset.string)();

// type Eq<T> = (a: T) => (b: T) => boolean;

// const eq: Construction<Eq<_>> = {};

// const g = con(eq);
