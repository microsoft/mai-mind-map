import { $, $Var } from './higher-kinded-type';

export type Dict<T> = Record<string, T>;
export type AnyDict = Dict<any>;

type $Struct<T, S extends AnyDict> = { [K in keyof S]: $<T, S[K]> };

/**
 * Behavior
 */
export type Behavior<T extends AnyDict> = {
  $string: $<T, string>;
  $number: $<T, number>;
  $boolean: $<T, boolean>;
  $array: <E>(elm: $<T, E>) => $<T, E[]>;
  $dict: <V>(val: $<T, V>) => $<T, Dict<V>>;
  $struct: <S extends AnyDict>(struct: $Struct<T, S>) => $<T, S>;
};

/**
 * Behavior Definition
 */
export type BehaviorDef<
  Type extends AnyDict,
  Base extends AnyDict = AnyDict,
> = {
  $string: (u: $<Base, string>) => $<Type, string>;
  $number: (u: $<Base, number>) => $<Type, number>;
  $boolean: (u: $<Base, boolean>) => $<Type, boolean>;
  $array: <E>(u: $<Base, E[]>) => (elm: $<Type & Base, E>) => $<Type, E[]>;
  $dict: <V>(
    u: $<Base, Dict<V>>,
  ) => (val: $<Type & Base, V>) => $<Type, Dict<V>>;
  $struct: <S extends AnyDict>(
    u: $<Base, S>,
  ) => (stt: $Struct<Type & Base, S>) => $<Type, S>;
};

const define = <Type extends AnyDict, Base extends AnyDict>(
  { $string, $number, $boolean, $array, $dict, $struct }: Behavior<Base>,
  def: BehaviorDef<Type, Base>,
) =>
  ({
    $string: Object.assign({}, $string, def.$string($string)),
    $number: Object.assign({}, $number, def.$number($number)),
    $boolean: Object.assign({}, $boolean, def.$boolean($boolean)),
    $array: <E>(elm: $<Type & Base, E>) => {
      const bhv = $array(elm);
      return Object.assign({}, bhv, def.$array(bhv)(elm));
    },
    $dict: <V>(val: $<Type & Base, V>) => {
      const bhv = $dict(val);
      return Object.assign({}, bhv, def.$dict(bhv)(val));
    },
    $struct: <S extends AnyDict>(stt: $Struct<Type & Base, S>) => {
      const bhv = $struct(stt);
      return Object.assign({}, bhv, def.$struct(bhv)(stt));
    },
  }) as Behavior<Type & Base>;

type Builder<U extends AnyDict> = {
  mixin: <T extends AnyDict>(def: BehaviorDef<T, U>) => Builder<T & U>;
  build: () => Behavior<U>;
};

const builder = <T extends AnyDict>(bhv: Behavior<T>): Builder<T> => ({
  mixin: (def) => builder(define(bhv, def)),
  build: () => bhv,
});

export const behavior = <T extends AnyDict>(bhv: Behavior<T>) =>
  ({
    $string: () => bhv.$string,
    $number: () => bhv.$number,
    $boolean: () => bhv.$boolean,
    $array: () => bhv.$array,
    $dict: () => bhv.$dict,
    $struct: () => bhv.$struct,
  }) as BehaviorDef<T>;

export const BehaviorBuilder = builder({
  $string: {},
  $number: {},
  $boolean: {},
  $array: () => ({}),
  $dict: () => ({}),
  $struct: () => ({}),
});
