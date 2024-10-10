import { behavior } from '../behavior';
import { $Var } from '../higher-kinded-type';
import { mapStruct } from '../struct';

export type Preset<T = $Var> = { preset: T };

const withPreset = <T>(preset: T): Preset<T> => ({ preset });

export default behavior<Preset>({
  $string: withPreset(''),
  $number: withPreset(0),
  $boolean: withPreset(false),
  $array: () => withPreset([]),
  $dict: () => withPreset({}),
  $struct: (stt) => withPreset(mapStruct(stt, ({ preset }) => preset)),
});

