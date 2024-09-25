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

const withRead = <T>(read: Reader<T>): Read<T> => ({ read });

const withReadPrim = <T extends string | number | boolean>({
  preset,
  typeName,
}: Preset<T> & TypeName): Read<T> =>
  withRead((raise) => (u) => {
    if (typeof u === typeof preset) {
      return u as T;
    }
    raise('')(`requires ${typeName}`);
    return preset;
  });

const read: BehaviorDef<Read, Preset & TypeName> = {
  $string: withReadPrim,
  $number: withReadPrim,
  $boolean: withReadPrim,
  $array:
    ({ preset, typeName }) =>
    ({ read }) =>
      withRead((raise) => (u) => {
        if (!Array.isArray(u)) {
          raise('')(`requires ${typeName}`);
          return preset;
        }
        return u.map((e, i) => read((path) => raise(`[${i}]${path}`))(e));
      }),
  $dict:
    ({ preset, typeName }) =>
    ({ read }) =>
      withRead((raise) => (u) => {
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
      withRead((raise) => (u) => {
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