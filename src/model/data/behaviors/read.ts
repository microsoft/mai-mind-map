import { BehaviorDef, behavior } from "../behavior";
import { $Var } from "../higher-kinded-type";
import { Preset } from "./preset";

export type Read<T = $Var> = {
  read: (u: unknown, raise?: (message: string) => void) => T;
};

const readWith = <T>(
  read: (u: unknown, raise: (message: string) => void) => T,
): Read<T> => ({ read: (u, raise = () => {}) => read(u, raise) });

const readPrim = <T extends string | number | boolean>({
  preset,
}: Preset<T>): Read<T> =>
  readWith((u, raise) => {
    if (typeof u === typeof preset) {
      return u as T;
    }
    raise(`requires @${typeof preset}`);
    return preset;
  });

// const read: BehaviorDef<Read, Preset> = {
//   $string: readPrim,
//   $number: readPrim,
//   $boolean: readPrim,
//   $array: ({ read }) => readWith((u, raise) => {
//     if (!Array.isArray(u)) {
//       raise('requires @array');
//       return [];
//     }
//     return u.map(read);
//   }),
//   $record: ({ read }) => readWith((u, raise) => {
//     if (typeof u !== 'object' || !u) {
      
//     }

//   }),
//   $struct: () => {},
// };

// export default read;