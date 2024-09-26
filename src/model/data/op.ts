import { Dict, mapStruct } from "./struct";

declare const symVar: unique symbol;
// A type for representing type variables
export type $Var = { [symVar]: typeof symVar };

declare const symOp: unique symbol;
export type $OpSign = { [symOp]: typeof symOp };
export type Prim = string | number | boolean;

/**
 * Update a primitive value
 * @param o the old value
 * @param n to value
 */

export type PrimOp<T extends Prim> = {
  o?: T;
  n: T;
  t: number;
};

/**
 * Update a segment in an array, could be deletion or insertion
 * @param i index
 * @param a array of values
 */

export type ArrayOplet<T> = { i: number; a: T[] };

/**
 * Update array
 * @param d deletions
 * @param i insertions
 */
export type ArrayOp<T> = { d: ArrayOplet<T>[]; i: ArrayOplet<T>[] };

export type Op<T> = T extends $Var
  ? $OpSign
  : T extends string
    ? PrimOp<string>
    : T extends number
      ? PrimOp<number>
      : T extends boolean
        ? PrimOp<boolean>
        : T extends Array<infer E>
          ? ArrayOp<E>
          : T extends object
            ? Partial<{ [K in keyof T]: Op<T[K]> }>
            : never;

export type Updater<T> = (v: T) => Op<T>;

export const $s = <T extends object>(stt: {
  [K in keyof T]: Updater<T[K]>
}): Updater<T> => (t: T) => mapStruct(stt, (f: any, key) => f(t[key])) as Op<T>;

export const $d = $s as <T>(dict: Dict<Updater<T>>) => Updater<Dict<T>>;

type Gen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : never;

export const updatePrim =
  (t: number) =>
  <T extends Prim>(n: T) =>
  (o: Gen<T>): PrimOp<Gen<T>> => ({ t, o, n: n as any });