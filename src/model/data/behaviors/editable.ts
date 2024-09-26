import { Maybe, just, nothing } from "@root/model/ot-doc/maybe";
import { BehaviorDef } from "../behavior";
import { $Var } from "../higher-kinded-type";
import { $Op, $PrimOp, Prim, op as $op } from "../op";
import { reduceDict, reduceStruct } from "../struct";
import { Eq } from "./eq";
import { Preset } from "./preset";

export type Update<T> = (
  updater: (a: T) => $Op<T>
) => (a: T) => { value: Maybe<T>; op: $Op<T> };

export type Editable<T = $Var> = { update: Update<T> };

const withUpdate = <T>(update: Update<T>): Editable<T> => ({ update });

const withUpdatePrim = <T extends Prim>(): Editable<T> =>
  withUpdate<T>(((updater) => (v) => {
    const op = updater(v);
    const { o, n } = op;
    return { value: o === v ? just(n) : nothing(), op };
  }) as Update<T>);

const editable: BehaviorDef<Editable, Eq & Preset> = {
  $string: withUpdatePrim,
  $number: withUpdatePrim,
  $boolean: withUpdatePrim,
  $array:
    ({ eq }) =>
    () =>
      withUpdate((updater) => (arrOld) => {
        const op = updater(arrOld);
        const { i: ins, d: del } = op;
        if (del.length === 0 && ins.length === 0)
          return { value: just(arrOld), op };
        const arrNew = [...arrOld];
        for (const { i: idx, a: arr } of del) {
          if (
            idx > arrNew.length ||
            idx < 0 ||
            !eq(arr)(arrNew.slice(idx, idx + arr.length))
          )
            return { value: nothing(), op };
          arrNew.splice(idx, arr.length);
        }
        for (const { i: idx, a: arr } of ins) {
          if (idx > arrNew.length || idx < 0) return { value: nothing(), op };
          arrNew.splice(idx, 0, ...arr);
        }
        return { value: just(arrNew), op };
      }),
  $dict:
    () =>
    ({ update, preset, eq }) =>
      withUpdate((f) => (dictOld) => {
        const op = f(dictOld);
        const value = reduceDict(
          op,
          (m, opVal, key) => {
            if (m.$ === "Nothing" || !opVal || typeof key !== "string")
              return m;
            const valOld = dictOld[key] ?? preset;
            const { value: mValNew, op } = update(() => $op(opVal))(valOld);
            if (mValNew.$ === "Nothing") return nothing();
            if (!eq(dictOld[key])(mValNew.v)) {
              if (m.v === dictOld) {
                m.v = { ...dictOld };
              }
              if (eq(preset)(mValNew.v)) {
                delete m.v[key];
              } else {
                m.v[key] = mValNew.v;
              }
            }
            return m;
          },
          just(dictOld)
        );
        return { value, op };
      }),
  $struct: () => (sttDoc) =>
    withUpdate((updater) => (sttOld) => {
      const op = updater(sttOld);

      const value = reduceStruct(
        sttOld,
        (m, valOld, key) => {
          const opKey = key as keyof typeof op;
          if (m.$ === "Nothing" || !op[opKey] || typeof opKey !== "string")
            return m;
          const { value: mValNew } = sttDoc[key].update(() =>
            $op(op[opKey] as any)
          )(valOld);
          if (mValNew.$ === "Nothing") return nothing();
          if (!sttDoc[key].eq(valOld)(mValNew.v)) {
            if (m.v === sttOld) {
              m.v = { ...sttOld };
            }
            m.v[key] = mValNew.v;
          }
          return m;
        },
        just(sttOld)
      );
      return { value, op };
    }),
};

export default editable;
