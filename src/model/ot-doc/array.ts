import { $Eq, $eqPrime } from './algebra';
import { $BaseDoc, $InvDoc, $idn, $init } from './document';
import { just, nothing } from './maybe';
import { $eqPartialStt, $eqStt } from './struct';

export type ArrayOplet<T> = { idx: number; arr: T[] };
export type ArrayOp<T> = Partial<{
  del: ArrayOplet<T>[];
  ins: ArrayOplet<T>[];
}>;

export const $eqArr = <T>({ equals }: $Eq<T>): $Eq<T[]> => ({
  equals: (arrA) => (arrB) => {
    if (arrA === arrB) return true;
    if (arrA.length !== arrB.length) return false;
    for (let i = 0; i < arrA.length; i += 1)
      if (!equals(arrA[i])(arrB[i])) return false;
    return true;
  },
});

export const $baseDocArr = <T>(cls: $Eq<T>): $BaseDoc<T[], ArrayOp<T>> => {
  const cpEquals = $eqArr(cls).equals;
  const $eqOplet = $eqArr(
    $eqStt({ idx: $eqPrime<number>(), arr: $eqArr(cls) }),
  );
  return {
    ...$init([]),
    ...$idn({}),
    cpEquals,
    opEquals: $eqPartialStt({ del: $eqOplet, ins: $eqOplet }).equals,
    compose:
      ({ del = [], ins = [] }) =>
      (cp) => {
        const cpR = [...cp];
        for (const { idx, arr } of del) {
          if (!cpEquals(arr)(cpR.slice(idx, idx + arr.length)))
            return nothing();
          cpR.splice(idx, arr.length);
        }
        for (const { idx, arr } of ins) {
          if (idx > cpR.length || idx < 0) return nothing();
          cpR.splice(idx, 0, ...arr);
        }
        return just(cpR);
      },
  };
};

export const $invDocArr = <T>(cls: $Eq<T>): $InvDoc<T[], ArrayOp<T>> => ({
  ...$baseDocArr(cls),
  invert: ({ del, ins }) => {
    const op: ArrayOp<T> = {};
    if (ins) op.del = [...ins].reverse();
    if (del) op.ins = [...del].reverse();
    return op;
  },
});
