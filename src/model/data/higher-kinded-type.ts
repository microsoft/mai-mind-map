import { $OpSign, $Var, Op } from './op';

// Type application (substitutes type variables with types)
export type $<T, S = $Var> = T extends $OpSign
  ? Op<S>
  : T extends $Var
    ? S
    : T extends undefined | null | boolean | string | number
      ? T
      : T extends Array<infer A>
        ? $<A, S>[]
        : T extends () => infer O
          ? () => $<O, S>
          : T extends (x: infer I) => infer O
            ? (x: $<I, S>) => $<O, S>
            : T extends object
              ? { [K in keyof T]: $<T[K], S> }
              : T;

export type { $Var };
