import { BehaviorDef } from '../behavior';
import { $Var } from '../higher-kinded-type';
import { $Struct, Dict, mapDict, mapStruct } from '../struct';
import { Preset } from './preset';
import { TypeName } from './type-name';

export type Reader<T> = (
  raise: (path: string) => (message: string) => void,
) => (u: unknown) => T;

export type Read<T = $Var> = {
  read: Reader<T>;
};

const readWith = <T>(read: Reader<T>): Read<T> => ({ read });

const readPrim = <T extends string | number | boolean>({
  preset,
}: Preset<T>): Read<T> =>
  readWith((raise) => (u) => {
    if (typeof u === typeof preset) {
      return u as T;
    }
    raise('')(`requires ${typeof preset}`);
    return preset;
  });

const read: BehaviorDef<Read, Preset & TypeName> = {
  $string: readPrim,
  $number: readPrim,
  $boolean: readPrim,
  $array:
    ({ preset, typeName }) =>
    ({ read }) =>
      readWith((raise) => (u) => {
        if (!Array.isArray(u)) {
          raise('')(`requires ${typeName}`);
          return preset;
        }
        return u.map((e, i) => read((path) => raise(`[${i}]${path}`))(e));
      }),
  $dict:
    ({ preset, typeName }) =>
    ({ read }) =>
      readWith((raise) => (u) => {
        if (typeof u !== 'object' || !u) {
          raise('')(`requires ${typeName}`);
          return preset;
        }
        return mapDict(u as Dict<unknown>, (v, key) =>
          read((path) => raise(`.${key}${path}`))(v),
        );
      }),
  $struct:
    ({ preset, typeName }) =>
    (stt) =>
      readWith((raise) => (u) => {
        if (typeof u !== 'object' || !u) {
          raise('')(`requires ${typeName}`);
          return preset;
        }
        return mapStruct(stt, ({ read }, key) =>
          read((path) => raise(`.${key as string}${path}`))(
            (u as $Struct<unknown, typeof stt>)[key],
          ),
        );
      }),
};

export default read;