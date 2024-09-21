import { $Eq } from './algebra';
import { $BaseDoc, $FullDoc, $InvDoc, $idn, $init } from './document';
import { Maybe, just, nothing } from './maybe';

export type Stt$Eq<T extends Record<string, unknown>> = {
  [K in keyof T]: $Eq<T[K]>;
};

export type Stt$BaseDoc<
  Cp extends Record<string, unknown>,
  Op extends Record<keyof Cp, any>,
> = {
  [K in keyof Cp]: $BaseDoc<Cp[K], Op[K]>;
};

export type Stt$InvDoc<
  Cp extends Record<string, unknown>,
  Op extends Record<keyof Cp, any>,
> = {
  [K in keyof Cp]: $InvDoc<Cp[K], Op[K]>;
};

export type Stt$FullDoc<
  Cp extends Record<string, unknown>,
  Op extends Record<keyof Cp, any>,
> = {
  [K in keyof Cp]: $FullDoc<Cp[K], Op[K]>;
};

const mapValues = <
  F extends Record<string, unknown>,
  T extends Record<keyof F, unknown>,
>(
  stt: F,
  f: <K extends keyof F>(v: F[K], k: K) => T[K],
): T =>
  Object.keys(stt).reduce(<K extends keyof F>(m: T, k: K) => {
    m[k] = f(stt[k], k);
    return m;
  }, {} as T);

const mapPartial = <
  F extends Record<string, unknown>,
  T extends Record<keyof F, unknown>,
>(
  stt: F,
  f: <K extends keyof F>(v: F[K], k: K) => T[K] | undefined,
): Partial<T> =>
  Object.keys(stt).reduce(<K extends keyof F>(m: T, k: K) => {
    const val = f(stt[k], k);
    if (val !== undefined) {
      m[k] = val;
    }
    return m;
  }, {} as T);

const mapMaybe = <
  F extends Record<string, unknown>,
  T extends Record<keyof F, unknown>,
>(
  stt: F,
  f: <K extends keyof F>(v: F[K], k: K) => Maybe<T[K] | undefined>,
): Maybe<Partial<T>> =>
  Object.keys(stt).reduce(
    <K extends keyof F>(m: Maybe<Partial<T>>, k: K): Maybe<Partial<T>> => {
      if (m.$ === 'Nothing') {
        return m;
      }
      const mVal = f(stt[k], k);
      if (mVal.$ === 'Nothing') {
        return nothing();
      }
      if (mVal.v !== undefined) {
        m.v[k] = mVal.v as T[K];
      }
      return m;
    },
    just({}) as Maybe<Partial<T>>,
  );

export const $eqStt = <T extends Record<string, unknown>>(
  stt$eq: Stt$Eq<T>,
): $Eq<T> => ({
  equals: (sttA) => (sttB) => {
    if (sttA === sttB) return true;
    const keys: (keyof T)[] = Object.keys(stt$eq);
    for (const key of keys)
      if (!stt$eq[key].equals(sttA[key])(sttB[key])) return false;
    return true;
  },
});

export const $eqPartialStt = <T extends Record<string, unknown>>(
  stt$eq: Stt$Eq<T>,
): $Eq<Partial<T>> => ({
  equals: (sttA) => (sttB) => {
    if (sttA === sttB) return true;
    const keys: (keyof T)[] = Object.keys(stt$eq);
    for (const key of keys) {
      const valA = sttA[key];
      const valB = sttB[key];
      if (valA === valB) continue;
      if (
        valA === undefined ||
        valB === undefined ||
        !stt$eq[key].equals(valA as T[typeof key])(valB as T[typeof key])
      )
        return false;
    }
    return true;
  },
});

export const $eqCp = <
  Cp extends Record<string, unknown>,
  Op extends Record<keyof Cp, unknown>,
>(
  stt$baseDoc: Stt$BaseDoc<Cp, Op>,
): $Eq<Partial<Cp>> =>
  $eqPartialStt(
    mapValues(
      stt$baseDoc,
      <K extends keyof Cp>({ cpEquals }: $BaseDoc<Cp[K], Op[K]>) => ({
        equals: cpEquals,
      }),
    ),
  );

export const $eqOp = <
  Cp extends Record<string, unknown>,
  Op extends Record<keyof Cp, unknown>,
>(
  stt$baseDoc: Stt$BaseDoc<Cp, Op>,
): $Eq<Partial<Op>> =>
  $eqPartialStt(
    mapValues(
      stt$baseDoc,
      <K extends keyof Cp>({ opEquals }: $BaseDoc<Cp[K], Op[K]>) => ({
        equals: opEquals,
      }),
    ),
  );

export const $baseDocStruct = <
  Cp extends Record<string, unknown>,
  Op extends Record<keyof Cp, any>,
>(
  stt$baseDoc: Stt$BaseDoc<Cp, Op>,
): $BaseDoc<Partial<Cp>, Partial<Op>> => {
  return {
    ...$init({}),
    ...$idn({}),
    compose: (sttOp) => (sttCp) =>
      mapMaybe(
        stt$baseDoc,
        <K extends keyof Cp>(
          { compose, initial, cpEquals, identity }: $BaseDoc<Cp[K], Op[K]>,
          key: K,
        ): Maybe<Cp[K] | undefined> => {
          const cpI = initial();
          const mCp = compose(sttOp[key] ?? identity())(sttCp[key] ?? cpI);

          if (mCp.$ === 'Nothing') {
            return nothing();
          }

          if (cpEquals(mCp.v)(cpI)) {
            return just(undefined);
          }

          return just(mCp.v);
        },
      ),
    cpEquals: $eqCp(stt$baseDoc).equals,
    opEquals: $eqOp(stt$baseDoc).equals,
  };
};

export const $invDocStruct = <
  Cp extends Record<string, unknown>,
  Op extends Record<keyof Cp, any>,
>(
  stt$invDoc: Stt$InvDoc<Cp, Op>,
): $InvDoc<Partial<Cp>, Partial<Op>> => ({
  ...$baseDocStruct(stt$invDoc),
  invert: (stt) =>
    mapPartial(
      stt$invDoc,
      <K extends keyof Cp>({ invert }: $InvDoc<Cp[K], Op[K]>, key: K) => {
        const val = stt[key];
        if (val === undefined) return undefined;
        return invert(val as Op[K]);
      },
    ),
});

export const $fullDocStruct = <
  Cp extends Record<string, unknown>,
  Op extends Record<keyof Cp, any>,
>(
  stt$fullDoc: Stt$FullDoc<Cp, Op>,
): $FullDoc<Partial<Cp>, Partial<Op>> => ({
  ...$invDocStruct(stt$fullDoc),
  transform: (sttA) => (sttB) =>
    mapMaybe(
      stt$fullDoc,
      <K extends keyof Cp>(
        { identity, transform, opEquals }: $FullDoc<Cp[K], Op[K]>,
        key: K,
      ): Maybe<Op[K] | undefined> => {
        const opI = identity();
        const mOp = transform(sttA[key] ?? opI)(sttB[key] ?? opI);
        if (mOp.$ === 'Nothing') {
          return nothing();
        }
        if (opEquals(mOp.v)(opI)) {
          return just(undefined);
        }
        return just(mOp.v);
      },
    ),
});
