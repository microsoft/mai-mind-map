import { Ordered, UnaryOperator } from "./algebra";
import { CheckpointMeta, DocumentMeta } from "./document-meta";

/**
 * Greater Write Wins document
 * Given an ordered set S, we can define a greater-write-wins document model.
 * Where the operation set is
 *    @5.1 T:
 *      T := { ι } ∪ { (x, y) | x, y ∈ S, x ≠ y }
 *    @5.2 Inv:
 *      @5.2.1 !ι      := ι
 *      @5.2.2 !(x, y) := (y, x)
 *                      obviously, (x, y) ∈ T → x ≠ y → (y, x) ∈ T
 *    @5.3 Comp:
 *      @5.3.1 a * ι           := a
 *      @5.3.2 ι * a           := a
 *      @5.3.3 (x, y) * (y, x) := ι
 *      @5.3.4 (x, y) * (y, z) := (x, z)      ... (x ≠ z)
 *    @5.4 Tran:
 *      @5.4.1 ι / a           := ι
 *      @5.4.2 a / ι           := a
 *      @5.4.3 (x, y) * (x, z) := ι           ... (y ≤ z)
 *      @5.4.4 (x, y) * (x, z) := (z, y)      ... (y > z)
 *
 * Prove:
 *    IdnP1 - Trivial, according to the defintion of `comp` @5.3
 *    IdnP2 - Trivial, according to the defintion of `tran` @5.4
 *    InvP1 -
 *      ι * !ι ={@5.3.2} !ι ={@5.2.1} ι
 *      !ι * ι ={@5.3.1} !ι ={@5.2.1} ι
 *      ∀ a, b ∈ S, a ≠ b
 *      (a, b) * !(a, b) ={@5.2.2} (a, b) * (b, a) ={5.3.3} = ι
 *    AsscP -
 *      ∀ a, b ∈ T
 *      (ι * a) * b ={@5.3.2} a * b ={@5.3.2} ι * (a * b)
 *      (a * b) * ι ={@5.3.1} a * b ={@5.3.1} a * (b * ι)
 *      case <a, b> ∈ Dom(*)
 *        (a * ι) * b ={@5.3.1} a * b ={@5.3.2} a * (ι * b)
 *      case <a, b> ∉ Dom(*)
 *        <a * ι, b> ={@5.3.1} <a, b> ∉ Dom(*)
 *        <a, ι * b> ={@5.3.2} <a, b> ∉ Dom(*)
 *      ∀ a, b, c ∈ { (x, y) | x, y ∈ S, x ≠ y }
 *      Because of <a, b>, <b, c> ∈ Dom(*), we can define
 *      a = (x, y), b = (y, z), c = (z, w) where
 *      x, y, z ∈ S, and x ≠ y, y ≠ z, z ≠ w
 *      Then
 *        (a * b) * c
 *      = ((x, y) * (y, z)) * (z, w)            ... @5.3.3, @5.3.4
 *      = (x = z ? ι : (x, z)) * (z, w)
 *      = x = z ? ι * (z, w) : (x, z) * (z, w)  ... @5.3.2
 *      = x = z ? (z, w) : (x, z) * (z, w)      ... @5.3.3, @5.3.4
 *      = x = z ? (z, w) : x = w ? ι : (x, w)
 *      = x = z ? (x, w) : x = w ? ι : (x, w)   ... z ≠ w
 *      = x = w ? ι : (x, w)
 *        a * (b * c)
 *      = (x, y) * ((y, z) * (z, w))            ... @5.3.3, @5.3.4
 *      = (x, y) * (y = w ? ι : (y, w))
 *      = y = w ? (x, y) * ι : (x, y) * (y, w)  ... @5.3.2
 *      = y = w ? (x, y) : (x, y) * (y, w)      ... @5.3.3, @5.3.4
 *      = y = w ? (x, y) : x = w ? ι : (x, w)
 *      = y = w ? (x, w) : x = w ? ι : (x, w)   ... x ≠ y
 *      = x = w ? ι : (x, w)
 *      = (a * b) * c
 *    CnvP1 -
 *      ∀ a ∈ T
 *      a * (ι / a) ={@4.2} a * ι ={@4.1} a
 *      ι * (a / ι) ={@4.2} ι * a ={@4.1} a
 *      Note. This part is independent from the document model, the proof only
 *      depends on the document properties (IdnP1 & IdnP2). For other document
 *      models, we only need to prove CnvP1 for 2 none ι operations.
 *      ∀ a, b ∈ { (x, y) | x, y ∈ S, x ≠ y }
 *      Because of <a, b> ∈ Dom(/), we can define
 *      a = (x, y), b = (x, z) where
 *      x, y, z ∈ S, x ≠ y, x ≠ z
 *        a * (b / a)
 *      = (x, y) * ((x, z) / (x, y))            ... @5.4.3, 5.4.4
 *      = (x, y) * (z > y ? (y, z) : ι)
 *      = z > y ? (x, y) * (y, z) : (x, y) * ι  ... @5.3.1
 *      = z > y ? (x, y) * (y, z) : (x, y)      ... x ≠ z, @5.3.4
 *      = z > y ? (x, z) : (x, y)
 *      = (x, max(z, y))
 *        b * (a / b)
 *      = (x, z) * ((x, y) / (x, z))            ... @5.4.3, 5.4.4
 *      = (x, z) * (y > z ? (z, y) : ι)
 *      = y > z ? (x, z) * (z, y) : (x, z) * ι  ... @5.3.1
 *      = y > z ? (x, z) * (z, y) : (x, z)      ... x ≠ y, @5.3.4
 *      = y > z ? (x, y) : (x, z)
 *      = (x, max(y, z))
 *      = a * (b / a)
 * Note, InvP2 doesn't hold for GWW document, counterexample:
 *        (1, 2) / (1, 3) / (3, 1)
 *      = ι / (3, 1)
 *      = ι
 *      ≠ (1, 2)
 *
 */
export type Pair<S> = [S, S];
export type Gww<S> = Pair<S> | null;

export const gwwDocument = <S>({
  lt = (a) => (b) => a < b,
  equ = (a) => (b) => a === b,
}: Partial<Ordered<S>> = {}): DocumentMeta<Gww<S>> => {
  const rep: UnaryOperator<Gww<S>> = (a) =>
    a === null || equ(a[0])(a[1]) ? null : a;
  return {
    idn: null,
    inv: (a) => (a ? (([x, y]) => rep([y, x]))(a) : null),
    comp: (a) => (b) => {
      const rA = rep(a);
      const rB = rep(b);
      if (rA && rB) {
        const [x, y] = rA;
        const [z, w] = rB;
        if (equ(y)(z)) {
          return rep([x, w]);
        }
        return undefined;
      }
      return rA ? rA : rB;
    },
    tran: (a) => (b) => {
      const rA = rep(a);
      const rB = rep(b);
      if (rA && rB) {
        const [x, y] = rA;
        const [z, w] = rB;
        if (equ(x)(z)) {
          return lt(w)(y) ? [w, y] : null;
        }
        return undefined;
      }
      return rA;
    },
    equ: (a) => (b) => {
      if (a === b) {
        return true;
      }
      const rA = rep(a);
      const rB = rep(b);
      if (rA && rB) {
        const [x, y] = rA;
        const [z, w] = rB;
        return equ(x)(z) && equ(y)(w);
      }
      return rA === rB;
    },
  };
};

export const gwwCheckpoint = <S>(dft: S): CheckpointMeta<Gww<S>, S> => ({
  opToCp: (op) => (op ? (op[0] === dft ? op[1] : undefined) : dft),
  cpToOp: (cp) => (cp === dft ? null : [dft, cp]),
});

