import { Maybe } from "./maybe";

export type Constant<T> = () => T;
export type UnaryOperator<T> = (a: T) => T;
export type PartialUnaryOperator<T> = (a: T) => Maybe<T>;
export type BinaryOperator<T> = (a: T) => UnaryOperator<T>;
export type PartialBinaryOperator<T> = (a: T) => PartialUnaryOperator<T>;
export type Predicate<T> = (a: T) => boolean;
export type Relation<T> = (a: T) => Predicate<T>;

// Use $PascalCase to represent a type class
export type $Eq<T> = {
  equals: Relation<T>;
};

export const $eqPrime = <T>(): $Eq<T> => ({
  equals: (a) => (b) => a === b
});

export type $Ord<T> = {
  lessThan: Relation<T>;
};

export const $ordPrime = <T>(): $Ord<T> => ({
  lessThan: (a) => (b) => a < b,
})