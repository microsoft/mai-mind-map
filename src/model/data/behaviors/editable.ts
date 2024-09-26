import { Maybe } from "@root/model/ot-doc/maybe";

/**
 * A timestamped value
 * @param t timestamp
 * @param v value
 */
export type Timestamped<V> = { t: number; v: V };

/**
 * Update a singleton value
 * @param f from value
 * @param t to value
 */

export type SingletonOp<T extends string | number | boolean> = {
  f: Timestamped<T>;
  t: Timestamped<T>;
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

export type Op<T> = T extends string | number | boolean
  ? SingletonOp<T>
  : T extends Array<infer E>
    ? ArrayOp<E>
    : T extends object
      ? { [K in keyof T]: Op<T[K]> }
      : never;

export type Editable<T> = {
  compose: (op: Op<T>) => (a: T) => Maybe<T>;
};

