export type UnaryOperator<T> = (a: T) => T;
export type PartialUnaryOperator<T> = (a: T) => T | undefined;
export type BinaryOperator<T> = (a: T) => UnaryOperator<T>;
export type PartialBinaryOperator<T> = (a: T) => PartialUnaryOperator<T>;
export type Predicate<T> = (a: T) => boolean;
export type Relation<T> = (a: T) => Predicate<T>;

/**
 * Before we define the Documents, we need to define a way to describe the
 * equivalence classes, say, the partitions. Ordinary type system provide
 * mechanisms to build "bigger" types from the primitive types. E.g. the union
 * types (A | B), product type ({ fst: A, snd: B }) or power types
 * { [K in string]: A }.
 * But there're no predefined way to define restricted * types. E.g. A complete
 * residue system modulo n { 0, 1, 2 ... n - 1 }, is a small subset of number.
 * When we proof the properties of document algorithms, one of the most
 * important preconditions is making sure the document operations are strictly
 * conform to the restrictions.
 * For example, we can easily proved the consistency property of the document on
 * additive group of integers modulo n. But if we simply use the JavaScript
 * number type to represent the operations, when a value 1.5 is passed to the
 * compose/inverse algorithm, the behavior would be unexpected.
 * The way we define stricted types is to use the equivalence classes. We can
 * map each number to the representative of a equivalence class. E.g.
 * x => Math.floor(x) % n.
 * Then every valid number in JavaScript is representing a value in the additive
 * group of integers modulo n.
 */

/**
 * Eq defines an equivalence relation over given type T.
 * The relation is denoted by `equ` or `~` in math.  (~) is required to have the
 * following properties
 *    @1.1 Reflexivity: ∀ a ∈ T, a ~ a
 *    @1.2 Symmetry: ∀ a, b ∈ T, a ~ b ↔ b ~ a
 *    @1.3 Transitivity: ∀ a, b, c ∈ T, a ~ b ∧ b ~ c → a ~ c
 * Obviously
 *    @2 <T, (=)> is an equivalence relation for all set T
 */
export type Eq<T> = {
  equ: Relation<T>;
};

export type Ordered<S> = Eq<S> & {
  lt: Relation<S>;
};

export const structLiftUnaryOperator =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <T extends Record<string, any>>(
    getIdn: <K extends keyof T>(key: K) => T[K],
  ) => (
    getEqu: <K extends keyof T>(key: K) => Relation<T[K]>
  ) => <U extends Partial<T>>(
    getUo: <K extends keyof T>(key: K) => UnaryOperator<T[K]>
  ) => (stt: U): U =>
    Object.entries(stt).reduce<U>(
      <K extends keyof T>(sttM: U, [key, u]: [K, T[K]]) => {
        if (sttM === stt) {
          sttM = { ...stt };
        }
        const newValue = getUo(key)(u);
        if (newValue === undefined || getEqu(key)(getIdn(key))(newValue)) {
          delete sttM[key];
        } else {
          sttM[key] = newValue;
        }
        return sttM;
      },
      stt
    );

export const structLiftPartialBinaryOperator =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <T extends Record<string, any>>(
    getIdn: <K extends keyof T>(key: K) => T[K],
  ) => (
    getEqu: <K extends keyof T>(key: K) => Relation<T[K]>
  ) => <U extends Partial<T>>(
    getPbo: <K extends keyof T>(key: K) => PartialBinaryOperator<T[K]>,
  ): PartialBinaryOperator<U> =>
  (sttA) =>
  (sttB) =>
    Object.entries(sttB).reduce(
      <K extends keyof T>(
        stt: U | undefined,
        [key, value]: [K, T[K]]
      ) => {
        if (stt === sttA) {
          stt = { ...sttA };
        }
        if (stt) {
          const idn = getIdn(key);
          const newValue = getPbo(key)(stt[key] ?? idn)(value);
          if (newValue === undefined) {
            return undefined;
          }
          if (getEqu(key)(idn)(newValue)) {
            delete stt[key];
          } else {
            stt[key] = newValue;
          }
        }
        return stt;
      },
      sttA as U | undefined
    );

export const structLiftEqu =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <T extends Record<string, any>>(
    getIdn: <K extends keyof T>(key: K) => T[K],
  ) => (
    getEqu: <K extends keyof T>(key: K) => Relation<T[K]>
  ): Relation<Partial<T>> => (sttA) => (sttB) => {
    if (sttA === sttB) {
      return true;
    }

    for (const key in sttA) {
      const valueA = sttA[key] as T[typeof key];
      const valueB = sttB[key] as T[typeof key] | undefined;
      const equA = getEqu(key)(valueA);
      if (!equA(valueB === undefined ? getIdn(key) : valueB)) {
        return false
      }
    }
    for (const key in sttB) {
      const valueB = sttB[key] as T[typeof key];
      const equB = getEqu(key)(valueB);
      if (!(key in sttA) && !equB(getIdn(key))) {
        return false;
      }
    }
    return true;
  }
