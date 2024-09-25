import { $, $Var } from './higher-kinded-type';

export type Rec<T> = Record<string, T>;
export type AnyRec = Rec<any>;

type $Intersection<T, U> = $<U> & $<T>;
type $Product<T, S extends AnyRec> = { [K in keyof S]: $<T, S[K]> };

/**
 * Behavior
 */
export type Behavior<T extends AnyRec> = {
  $string: $<T, string>;
  $number: $<T, number>;
  $boolean: $<T, boolean>;
  $array: <E>(elm: $<T, E>) => $<T, E[]>;
  $record: <V>(val: $<T, V>) => $<T, Rec<V>>;
  $struct: <S extends AnyRec>(struct: $Product<T, S>) => $<T, S>;
};

/**
 * Type Class Definition
 */
export type BehaviorDef<Type extends AnyRec, Base extends AnyRec> = {
  $string: (u: $<Base, string>) => $<Type, string>;
  $number: (u: $<Base, number>) => $<Type, number>;
  $boolean: (u: $<Base, boolean>) => $<Type, boolean>;
  $array: <E>(elm: $<$Intersection<Type, Base>, E>) => $<Type, E[]>;
  $record: <V>(val: $<$Intersection<Type, Base>, V>) => $<Type, Rec<V>>;
  $struct: <S extends AnyRec>(
    stt: $Product<$Intersection<Type, Base>, S>,
  ) => $<Type, S>;
};

const define = <Type extends AnyRec, Base extends AnyRec>(
  { $string, $number, $boolean, $array, $record, $struct }: Behavior<Base>,
  def: BehaviorDef<Type, Base>,
) =>
  ({
    $string: Object.assign({}, $string, def.$string($string)),
    $number: Object.assign({}, $number, def.$number($number)),
    $boolean: Object.assign({}, $boolean, def.$boolean($boolean)),
    $array: <E>(elm: $<$Intersection<Type, Base>, E>) =>
      Object.assign({}, $array(elm as $<Base, E>), def.$array(elm)),
    $record: <V>(val: $<$Intersection<Type, Base>, V>) =>
      Object.assign({}, $record(val as $<Base, V>), def.$record(val)),
    $struct: <S extends AnyRec>(stt: $Product<$Intersection<Type, Base>, S>) =>
      Object.assign({}, $struct(stt as $Product<Base, S>), def.$struct(stt)),
  }) as Behavior<$Intersection<Type, Base>>;

type Builder<U extends AnyRec> = {
  mixin: <T extends AnyRec>(
    def: BehaviorDef<T, U>,
  ) => Builder<$Intersection<T, U>>;
  build: () => Behavior<U>;
};

const builder = <T extends AnyRec>(bhv: Behavior<T>): Builder<T> => ({
  mixin: (def) => builder(define(bhv, def)),
  build: () => bhv,
});

export const behavior = <T extends AnyRec, U extends AnyRec>(
  bhv: Behavior<T>,
): BehaviorDef<T, U> => ({
  $string: () => bhv.$string,
  $number: () => bhv.$number,
  $boolean: () => bhv.$boolean,
  $array: bhv.$array as BehaviorDef<T, U>['$array'],
  $record: bhv.$record as BehaviorDef<T, U>['$record'],
  $struct: bhv.$struct as BehaviorDef<T, U>['$struct'],
});

export const BehaviorBuilder = builder({
  $string: {},
  $number: {},
  $boolean: {},
  $array: () => ({}),
  $record: () => ({}),
  $struct: () => ({}),
});
