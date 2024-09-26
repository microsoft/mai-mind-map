import { Maybe, just, nothing } from "@root/model/ot-doc/maybe";
import { BehaviorDef } from "../behavior";
import { $, $Var } from "../higher-kinded-type";
import { $Op, $OpSign, $PrimOp, Prim, PrimOp, op } from "../op";
import { reduceDict, reduceStruct } from "../struct";
import { Eq } from "./eq";
import { Preset } from "./preset";

export type Editable<T = $Var> = {
  compose: (op: $Op<T>) => (a: T) => Maybe<T>;
};

const withCompose = <T>(
  compose: (op: $Op<T>) => (a: T) => Maybe<T>,
): Editable<T> => ({ compose });

const composePrim = <T extends Prim>({ o, n }: $PrimOp<T>) => (v: T): Maybe<T> => o === v ? just(n) : nothing();

const editable: BehaviorDef<Editable, Eq & Preset> = {
  $string: () => withCompose(composePrim),
  $number: () => withCompose(composePrim),
  $boolean: () => withCompose(composePrim),
  $array:
    ({ eq }) =>
    () =>
      withCompose(({ i: ins, d: del }) => (arrOld) => {
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
  $dict: () => ({ compose, preset, eq }) => withCompose((dictOp) => (dictOld) => reduceDict(dictOp, (m, opVal, key) => {
    if (m.$ === 'Nothing' || !opVal || typeof key !== 'string') return m;
    const valOld = dictOld[key] ?? preset;
    const mValNew = compose(op(opVal))(valOld);
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
    withCompose(
      (sttOp) => (sttOld) => reduceStruct(sttOld, (m, valOld, key) => {
        const opKey = key as keyof typeof sttOp;
        if (m.$ === 'Nothing' || !sttOp[opKey] || typeof opKey !== 'string') return m;
        const valNew = sttDoc[key].compose(op(sttOp[opKey] as any))(valOld);
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

