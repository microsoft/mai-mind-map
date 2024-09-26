declare const symVar: unique symbol;
// A type for representing type variables
export type $Var = { [symVar]: typeof symVar };

const symOp = Symbol();
export type $OpSign<T> = { [symOp]: typeof symOp };
export type Prim = string | number | boolean;

/**
 * Update a primitive value
 * @param o the old value
 * @param n to value
 */

export type PrimOp<T extends Prim> = {
  o: T;
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
  ? $OpSign<$Var>
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

export type $Op<T> = Op<T> & $OpSign<T>;
export type $PrimOp<T extends Prim> = PrimOp<T> & $OpSign<T>;

export const op = <T>(op: Op<T>): $Op<T> => ({ [symOp]: symOp, ...op });

