import { Relation } from "@root/model/ot-doc/algebra";
import { $Var } from "../higher-kinded-type";
import { Behavior, behavior } from "../behavior";

export type Eq<T = $Var> = { eq: Relation<T> };

const eqWith = <T>(f: Relation<T> = () => () => false): Eq<T> => ({
  eq: (a) => (b) => a === b || f(a)(b),
});

const eq: Behavior<Eq> = {
  $string: eqWith(),
  $number: eqWith(),
  $boolean: eqWith(),
  $array: ({ eq }) =>
    eqWith((a) => (b) => {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i += 1) if (!eq(a[i])(b[i])) return false;
      return true;
    }),
  $dict: ({ eq }) =>
    eqWith((a) => (b) => {
      for (const key in a) if (!(key in b) || !eq(a[key])(b[key])) return false;
      for (const key in b) if (!(key in a)) return false;
      return true;
    }),
  $struct: (stt) =>
    eqWith((a) => (b) => {
      for (const key in stt) if (!stt[key].eq(a[key])(b[key])) return false;
      return true;
    }),
} as Behavior<Eq>;

export default behavior(eq);
