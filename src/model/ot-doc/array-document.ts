
/**
 * Array document
 * Given an ordered set S, we can define an array document model.
 * (As the set theory notations to express Array/List are not convenient to
 * use, I'll switch to Haskell notation instead)
 *    @8.1 T:
 *      data E s = Ins Integer s
 *               | Del Integer s
 *      type T s = [E s]
 *    @8.2 Idn:
 *      idn :: [E s]
 *      idn = []
 *    @8.3 Inv:
 *      inv :: Order s => [E s] -> [E s]
 *      inv = inverse . (
 *              fmap $ \case
 *                Ins n s -> Del n s
 *                Del n s -> Ins n s)
 *    @8.4 Comp:
 *      comp :: Order s => [E s] -> [E s] -> Maybe [E s]
 *      comp xs ys = combine (inverse xs) ys where
 *        combine [] ys         = Just ys
 *        combine xs []         = Just (inverse xs)
 *        combine (x:xs) (y:ys) =
 *          case (x, y) of
 *            (Ins m u) (Del n v) -> if m == n
 *                                    then if u == v then comp xs ys
 *                                                   else Nothing
 *                                    else combine xs (x:y:ys)
 *            (Del m u) (Ins n v) -> if m == n
 *                                    then if u == v then comp xs ys
 *                                                   else Nothing
 *                                    else combine xs (x:y:ys)
 *            otherwise           -> combine xs (x:y:ys)
 *    @8.5 Tran:
 *      tran :: Order s => [E s] -> [E s] -> Maybe [E s]
 *      tran = liftTran tranElem where
 *        tranElem :: E s -> E s -> Maybe [E s]
 *        tranElem (Ins m x) (Ins n y)
 *          | m < n     = Just [Ins m x]
 *          | m > n     = Just [Ins (m + 1) x]
 *          | x < y     = Just [Ins m x)
 *          | otherwise = Just ]Ins (m + 1) x]
 *        tranElem (Del m x) (Ins n y)
 *          | m < n     = Just [Del m x]
 *          | otherwise = Just [Del (m + 1) x]
 *        tranElem (Ins m x) (Del n y)
 *          | m <= n    = Just [Ins m x]
 *          | otherwise = Just [Ins (m - 1) x]
 *        tranElem (Del m x) (Del n y)
 *          | m < n     = Just [Del m x]
 *          | m > n     = Just [Del (m - 1) x]
 *          | x == y    = Just []
 *          | otherwise = Nothing
 */

import { Ordered } from "./algebra";
import { DocumentMeta } from "./document-meta";

export type ArrayOplet<T> = {
  typ: 'ins' | 'del',
  idx: number,
  val: T,
};

export type ArrayOp<T> = ArrayOplet<T>[];

export const arrayDocument = <T>({
  // lt = (a) => (b) => a < b,
  equ = (a) => (b) => a === b,
}: Partial<Ordered<T>> = {}): DocumentMeta<ArrayOp<T>>  => {
  const rep = (a: ArrayOp<T>): ArrayOp<T> | undefined => {
    let r = a;
    let i = 0;
    let updated = false;
    const update = (...ops: ArrayOplet<T>[]): void => {
      if (r === a) r = [...a];
      r.splice(i, 2, ...ops);
      i = Math.max(i + ops.length - 1, 0);
      updated = true;
    };

    do {
      updated = false;
      i = 0;
      while (i < r.length - 1) {
        const eA = r[i];
        const eB = r[i + 1];
        if (eA.typ === 'ins') {
          if (eB.typ === 'ins') {
            if (eA.idx >= eB.idx) {
              update(eB, { ...eA, idx: eA.idx + 1});
            } else {
              i += 1;
            }
          } else {
            if (eA.idx < eB.idx) {
              update({ ...eB, idx: eB.idx - 1 }, eA);
            } else if (eA.idx > eB.idx) {
              update(eB, { ...eA, idx: eA.idx - 1 });
            } else if (equ(eA.val)(eB.val)) {
              update();
            } else {
              return undefined;
            }
          }
        } else if (eB.typ === 'ins' && eA.idx === eB.idx && equ(eA.val)(eB.val)) {
          update()
        } else if (eB.typ === 'del' && eA.idx <= eB.idx) {
          update({ ...eB, idx: eB.idx + 1 }, eA);
        } else {
          i += 1;
        }
      }
    } while (updated);
    return r;
  };

  return {
    idn: [],
    inv: (a) =>
      a
        .map(({ typ, idx, val }): ArrayOplet<T> => ({
          typ: typ === 'ins' ? 'del' : 'ins',
          idx,
          val,
        }))
        .reverse(),
    comp: (a) => (b) => rep([...a, ...b]),
    tran: (a) => (/* b */) => a, // TODO
    equ: (a) => (b) => {
      if (a === b) return true;
      const rA = rep(a);
      const rB = rep(b);
      if (!rA || !rB) return false;
      if (rA.length !== rB.length) return false;
      for (let i = 0; i < rA.length; i += 1) {
        const eA = rA[i];
        const eB = rB[i];
        if (eA.typ !== eB.typ || eA.idx !== eB.idx || !equ(eA.val)(eB.val)) {
          return false;
        }
      }
      return true;
    },
  };
};

export const insertAt = <T>(i: number, ...arr: T[]): ArrayOp<T> =>
  arr.map((val, j) => ({ typ: 'ins', val, idx: i + j }));

export const deleteAt = <T>(i: number, ...arr: T[]): ArrayOp<T> =>
  arr.map((val, j): ArrayOplet<T> => ({ typ: 'del', val, idx: i + j })).reverse();

export type CompactArrayOp<T> = Partial<{
  del: { idx: number, arr: T[] }[],
  ins: { idx: number, arr: T[] }[],
}>;

export function compact<T>(meta: DocumentMeta<ArrayOp<T>>): DocumentMeta<CompactArrayOp<T>> {
  function compress(op: ArrayOp<T>): CompactArrayOp<T> | undefined {
    const rep = meta.comp(op)(meta.idn);
    if (!rep) return undefined;
    return rep.reduce((m, { typ, idx, val }) => {
      if (typ === 'del') {
        m.del ??= [{ idx: idx + 1, arr: [] }];
        const lastDel = m.del[m.del.length - 1];
        if (lastDel.idx === idx + 1) {
          lastDel.idx = idx;
          lastDel.arr.unshift(val);
        } else {
          m.del.push({ idx, arr: [val] });
        }
      } else {
        m.ins ??= [{ idx, arr: [] }];
        const lastIns = m.ins[m.ins.length - 1];
        if (lastIns.idx + lastIns.arr.length === idx) {
          lastIns.arr.push(val);
        } else {
          m.ins.push({ idx, arr: [val]});
        }
      }
      return m;
    }, {} as CompactArrayOp<T>);
  }

  function decompress(op: CompactArrayOp<T>): ArrayOp<T> | undefined {
    return meta.comp(
      (op.del ?? []).reduce((m, { idx, arr }) => {
        m.concat(
          arr
            .map((val, i): ArrayOplet<T> => ({ typ: 'del', val, idx: idx + i }))
            .reverse()
        );
        return m;
      }, [] as ArrayOp<T>)
    )(
      (op.ins ?? []).reduce((m, { idx, arr }) => {
        m.concat(
          arr.map(
            (val, i): ArrayOplet<T> => ({ typ: 'ins', val, idx: idx + i })
          )
        );
        return m;
      }, [] as ArrayOp<T>)
    );
  }


  return {
    idn: {},
    inv: ({ ins, del }) => {
      const r: CompactArrayOp<T> = {};
      if (ins) {
        r.del = [...ins].reverse();
      }
      if (del) {
        r.ins = [...del].reverse();
      }
      return r;
    },
    comp: (a) => (b) => {
      const dcA = decompress(a);
      const dcB = decompress(b);
      if (!dcA || !dcB) return undefined;
      const dcC = meta.comp(dcA)(dcB);
      if (!dcC) return undefined;
      return compress(dcC);
    },
    tran: (a) => (/* b */) => a, // TODO
    equ: (a) => (b) => {
      if (a === b) return true;
      const dcA = decompress(a);
      const dcB = decompress(b);
      if (dcA && dcB) return meta.equ(dcA)(dcB);
      return dcA === dcB; // Iff both are undefined
    },
  };
};