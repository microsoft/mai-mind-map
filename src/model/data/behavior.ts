import { $, $Var } from './higher-kinded-type';

export type Dict<T> = Record<string, T>;
export type AnyDict = Dict<any>;

type $Intersection<T, U> = $<U> & $<T>;
type $Product<T, S extends AnyDict> = { [K in keyof S]: $<T, S[K]> };

/**
 * Behavior
 */
export type Behavior<T extends AnyDict> = {
  $string: $<T, string>;
  $number: $<T, number>;
  $boolean: $<T, boolean>;
  $array: <E>(elm: $<T, E>) => $<T, E[]>;
  $dict: <V>(val: $<T, V>) => $<T, Dict<V>>;
  $struct: <S extends AnyDict>(struct: $Product<T, S>) => $<T, S>;
};

/**
 * Type Class Definition
 */
export type BehaviorDef<Type extends AnyDict, Base extends AnyDict> = {
  $string: (u: $<Base, string>) => $<Type, string>;
  $number: (u: $<Base, number>) => $<Type, number>;
  $boolean: (u: $<Base, boolean>) => $<Type, boolean>;
  $array: <E>(u: $<Base, E[]>) => (
    elm: $<$Intersection<Type, Base>, E>,
  ) => $<Type, E[]>;
  $dict: <V>(u: $<Base, Dict<V>>) => (
    val: $<$Intersection<Type, Base>, V>,
  ) => $<Type, Dict<V>>;
  $struct: <S extends AnyDict>(u: $<Base, S>) => (
    stt: $Product<$Intersection<Type, Base>, S>,
  ) => $<Type, S>;
};

const define = <Type extends AnyDict, Base extends AnyDict>(
  { $string, $number, $boolean, $array, $dict, $struct }: Behavior<Base>,
  def: BehaviorDef<Type, Base>,
) =>
  ({
    $string: Object.assign({}, $string, def.$string($string)),
    $number: Object.assign({}, $number, def.$number($number)),
    $boolean: Object.assign({}, $boolean, def.$boolean($boolean)),
    $array: <E>(elm: $<$Intersection<Type, Base>, E>) =>
      Object.assign(
        {},
        $array(elm as $<Base, E>),
        def.$array($array(elm as $<Base, E>))(elm),
      ),
    $dict: <V>(val: $<$Intersection<Type, Base>, V>) =>
      Object.assign(
        {},
        $dict(val as $<Base, V>),
        def.$dict($dict(val as $<Base, V>))(val),
      ),
    $struct: <S extends AnyDict>(stt: $Product<$Intersection<Type, Base>, S>) =>
      Object.assign(
        {},
        $struct(stt as $Product<Base, S>),
        def.$struct($struct(stt as $Product<Base, S>))(stt),
      ),
  }) as Behavior<$Intersection<Type, Base>>;

type Builder<U extends AnyDict> = {
  mixin: <T extends AnyDict>(
    def: BehaviorDef<T, U>,
  ) => Builder<$Intersection<T, U>>;
  build: () => Behavior<U>;
};

const builder = <T extends AnyDict>(bhv: Behavior<T>): Builder<T> => ({
  mixin: (def) => builder(define(bhv, def)),
  build: () => bhv,
});

export const behavior = <T extends AnyDict, U extends AnyDict>(
  bhv: Behavior<T>,
) =>
  ({
    $string: () => bhv.$string,
    $number: () => bhv.$number,
    $boolean: () => bhv.$boolean,
    $array: () => bhv.$array,
    $dict: () => bhv.$dict,
    $struct: () => bhv.$struct,
  }) as BehaviorDef<T, U>;

export const BehaviorBuilder = builder({
  $string: {},
  $number: {},
  $boolean: {},
  $array: () => ({}),
  $dict: () => ({}),
  $struct: () => ({}),
});
