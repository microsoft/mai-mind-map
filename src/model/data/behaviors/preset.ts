import { AnyDict, Behavior, Dict, behavior } from "../behavior";
import { $Var } from "../higher-kinded-type";

export type Preset<T = $Var> = { preset: T };

const presetWith = <T>(preset: T): Preset<T> => ({ preset });

const preset: Behavior<Preset> = {
  $string: presetWith(''),
  $number: presetWith(0),
  $boolean: presetWith(false),
  $array: <E>(elm: Preset<E>) => presetWith<E[]>([]),
  $dict: <V>(val: Preset<V>) => presetWith<Dict<V>>({}),
  $struct: <S extends AnyDict>(
    stt: { [K in keyof S]: Preset<S[K]> },
  ): Preset<S> =>
    presetWith(
      (Object.keys(stt) as (keyof S)[]).reduce((m, key) => {
        m[key] = stt[key].preset;
        return m;
      }, {} as S),
    ),
};

export default behavior(preset);
