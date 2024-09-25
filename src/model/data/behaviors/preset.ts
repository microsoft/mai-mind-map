import { AnyDict, Behavior, behavior } from '../behavior';
import { $Var } from '../higher-kinded-type';

export type Preset<T = $Var> = { preset: T };

const presetWith = <T>(preset: T): Preset<T> => ({ preset });

const preset = {
  $string: presetWith(''),
  $number: presetWith(0),
  $boolean: presetWith(false),
  $array: () => presetWith([]),
  $dict: () => presetWith({}),
  $struct: (stt) =>
    presetWith(
      Object.keys(stt).reduce((m, key) => {
        m[key] = stt[key].preset;
        return m;
      }, {} as AnyDict),
    ),
} as Behavior<Preset>;

export default behavior(preset);

const t = preset.$array(preset.$string);
