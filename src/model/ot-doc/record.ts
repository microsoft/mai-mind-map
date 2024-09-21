import { $Eq } from './algebra';
import { $BaseDoc, $FullDoc, $InvDoc, $idn, $init } from './document';
import { just, nothing } from './maybe';

export type Rec<T> = Record<string, T>;

export const mapRec = <F, T>(rec: Rec<F>, f: (v: F, k: string) => T): Rec<T> =>
  Object.keys(rec).reduce(
    (m: Rec<T>, key) => {
      m[key] = f(rec[key], key);
      return m;
    },
    {} as Rec<T>,
  );

export const $eqRec = <T>({ equals }: $Eq<T>): $Eq<Rec<T>> => ({
  equals: (recA) => (recB) => {
    if (recA === recB) return true;
    const keys = Object.keys(recA);
    if (Object.keys(recB).length !== keys.length) return false;
    for (const key of keys) {
      const valA = recA[key];
      const valB = recB[key];
      if (valA === valB) continue;
      if (
        valA === undefined ||
        valB === undefined ||
        !equals(recA[key])(recB[key])
      )
        return false;
    }
    return true;
  },
});

export const $baseDocRecord = <Cp, Op>({
  initial,
  compose,
  cpEquals,
  opEquals,
}: $BaseDoc<Cp, Op>): $BaseDoc<Record<string, Cp>, Record<string, Op>> => {
  const cpI = initial();

  return {
    ...$init({}),
    ...$idn({}),
    compose: (op) => (cp) =>
      Object.keys(op).reduce((cpT, key) => {
        if (cpT.$ === 'Nothing') {
          return cpT;
        }
        const cpK = cpT.v[key] ?? cpI;
        const opK = op[key];
        const mNewCpK = compose(opK)(cpK);
        if (mNewCpK.$ === 'Nothing') {
          return nothing();
        }
        const { v: newCpK } = mNewCpK;
        if (!cpEquals(newCpK)(cpK)) {
          if (cpT.v === cp) {
            cpT.v = { ...cp };
          }
          if (cpEquals(newCpK)(cpI)) {
            delete cpT.v[key];
          } else {
            cpT.v[key] = newCpK;
          }
        }
        return cpT;
      }, just(cp)),
    cpEquals: $eqRec({ equals: cpEquals }).equals,
    opEquals: $eqRec({ equals: opEquals }).equals,
  };
};

export const $invDocRecord = <Cp, Op>(
  clsDoc: $InvDoc<Cp, Op>,
): $InvDoc<Record<string, Cp>, Record<string, Op>> => {
  const { invert } = clsDoc;
  return {
    ...$baseDocRecord(clsDoc),
    invert: (op) =>
      Object.keys(op).reduce(
        (opT, key) => {
          opT[key] = invert(op[key]);
          return opT;
        },
        {} as Record<string, Op>,
      ),
  };
};

export const $fullDocRecord = <Cp, Op>(
  clsDoc: $FullDoc<Cp, Op>,
): $FullDoc<Record<string, Cp>, Record<string, Op>> => {
  const { transform, identity, opEquals } = clsDoc;
  const opI = identity();

  return {
    ...$invDocRecord(clsDoc),
    transform: (opA) => (opB) =>
      Object.keys(opA).reduce((mOpT, key) => {
        if (mOpT.$ === 'Nothing' || !(key in opB)) {
          return mOpT;
        }
        const opKA = mOpT.v[key];
        const opKB = opB[key];
        const mNewOpKA = transform(opKA)(opKB);
        if (mNewOpKA.$ === 'Nothing') {
          return nothing();
        }
        const { v: newOpKA } = mNewOpKA;
        if (!opEquals(newOpKA)(opKA)) {
          if (mOpT.v === opA) {
            mOpT.v = { ...opA };
          }
          if (opEquals(newOpKA)(opI)) {
            delete mOpT.v[key];
          } else {
            mOpT.v[key] = newOpKA;
          }
        }
        return mOpT;
      }, just(opA)),
  };
};
