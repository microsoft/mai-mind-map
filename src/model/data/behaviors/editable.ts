import { Maybe, just, nothing } from "@root/model/ot-doc/maybe";
import { BehaviorDef } from "../behavior";
import { $Var } from "../higher-kinded-type";
import { $Op, $PrimOp, Prim, op } from "../op";
import { reduceDict, reduceStruct } from "../struct";
import { Eq } from "./eq";
import { Preset } from "./preset";

export type Editable<T = $Var> = {
  update: (op: (a: T) => $Op<T>) => (a: T) => Maybe<T>;
};

const withUpdate = <T>(
  update: (op: (a: T) => $Op<T>) => (a: T) => Maybe<T>,
): Editable<T> => ({ update });

const updatePrim = <T extends Prim>(op: (a: T) => $PrimOp<T>) => (v: T): Maybe<T> => {
  const { o, n } = op(v);
  return o === v ? just(n) : nothing();
}

const editable: BehaviorDef<Editable, Eq & Preset> = {
  $string: () => withUpdate(updatePrim),
  $number: () => withUpdate(updatePrim),
  $boolean: () => withUpdate(updatePrim),
  $array:
    ({ eq }) =>
    () =>
      withUpdate((f) => (arrOld) => {
        const { i: ins, d: del } = f(arrOld);
        if (del.length === 0 && ins.length === 0) return just(arrOld);
        const arrNew = [...arrOld];
        for (const { i: idx, a: arr } of del) {
          if (
            idx > arrNew.length ||
            idx < 0 ||
            !eq(arr)(arrNew.slice(idx, idx + arr.length))
          )
            return nothing();
          arrNew.splice(idx, arr.length);
        }
        for (const { i: idx, a: arr } of ins) {
          if (idx > arrNew.length || idx < 0) return nothing();
          arrNew.splice(idx, 0, ...arr);
        }
        return just(arrNew);
      }),
  $dict: () => ({ update, preset, eq }) => withUpdate((f) => (dictOld) => reduceDict(f(dictOld), (m, opVal, key) => {
    if (m.$ === 'Nothing' || !opVal || typeof key !== 'string') return m;
    const valOld = dictOld[key] ?? preset;
    const mValNew = update(() => op(opVal))(valOld);
    if (mValNew.$ === 'Nothing') return nothing();
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
  }, just(dictOld))),
  $struct: () => (sttDoc) =>
    withUpdate(
      (f) => (sttOld) => reduceStruct(sttOld, (m, valOld, key) => {
        const sttOp = f(sttOld);
        const opKey = key as keyof typeof sttOp;
        if (m.$ === 'Nothing' || !sttOp[opKey] || typeof opKey !== 'string') return m;
        const valNew = sttDoc[key].update(() => op(sttOp[opKey] as any))(valOld);
        if (valNew.$ === 'Nothing') return nothing();
        if (!sttDoc[key].eq(valOld)(valNew.v)) {
          if (m.v === sttOld) {
            m.v = { ...sttOld };
          }
          m.v[key] = valNew.v;
        }
        return m;
      }, just(sttOld))
    ),
};

export default editable;

