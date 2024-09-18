import { structLiftEqu, structLiftPartialBinaryOperator, structLiftUnaryOperator } from './algebra';
import { DocumentMeta } from './document-meta';

/**
 * Power document
 * Given a document on operation set U and a key set K, we can define document
 * over the power set U ^ K (or K -> U).
 *    @6.1 T:
 *      T := U ^ K
 *    @6.2 Idn:
 *      ι := _ -> ι[U]
 *    @6.3 Inv:
 *      !f := k -> ![U] f(k)
 *    @6.4 Comp:
 *      f * g := k -> f(k) *[U] g(k)
 *      Dom(*) = { <f, g> | ∀ k ∈ K, <f(k), g(k)> ∈ Dom<*[U]> }
 *    @6.5 Tran:
 *      f / g := k -> f(k) /[U] g(k)
 *      Dom(/) = { <f, g> | ∀ k ∈ K, <f(k), g(k)> ∈ Dom</[U]> }
 *  Prove:
 *    IdnP1 -
 *      ∀ f ∈ T
 *      ι * f ={@6.4} k -> ι(k) *[U] f(k)
 *            ={@6.2} k -> ι[U] *[U] f(k)
 *            ={@4.1} k -> f(k)
 *            ={η}    f
 *      f * ι ={@6.4} k -> f(k) *[U] ι(k)
 *            ={@6.2} k -> f(k) *[U] ι[U]
 *            ={@4.1} k -> f(k)
 *            ={η}    f
 *    IdnP2 -
 *      ∀ f ∈ T
 *      ι / f ={@6.5} k -> ι(k) /[U] f(k)
 *            ={@6.2} k -> ι[U] /[U] f(k)
 *            ={@4.2} k -> ι[U]
 *            ={α}    _ -> ι[U]
 *            ={@6.2} ι
 *      f / ι ={@6.5} k -> f(k) /[U] ι(k)
 *            ={@6.2} k -> f(k) /[U] ι[U]
 *            ={@4.2} k -> f(k)
 *            ={η}    f
 *    InvP1 -
 *      ∀ f ∈ T
 *      f * !f  ={@6.4} k -> f(k) *[U] (!f)(k)
 *              ={@6.3} k -> f(k) *[U] ![U]f(k)
 *              ={@4.3} k -> ι[U]
 *              ={α}    _ -> ι[U]
 *              ={@6.2} ι
 *      !f * f  ={@6.4} k -> (!f)(k) *[U] f(k)
 *              ={@6.3} k -> ![U]f(k) *[U] f(k)
 *              ={@4.3} k -> ι[U]
 *              ={α}    _ -> ι[U]
 *              ={@6.2} ι
 *    AsscP -
 *      ∀ f, g, h ∈ T, <f, g>, <g, h> ∈ Dom(*)
 *        (f * g) * h                     ... @6.4
 *      = (k -> f(k) *[U] g(k)) * h       ... @6.4, β
 *      = k -> (f(k) *[U] g(k)) *[U] h(k) ... @4.4
 *      = k -> f(k) *[U] (g(k) *[U] h(k)) ... @6.4
 *      = f * (k -> g(k) *[U] h(k))       ... @6.4
 *      = f * (g * h)
 *    ConvP1 -
 *      ∀ f, g ∈ T, <f, g> ∈ Dom(/)
 *        g * (f / g)
 *      = k -> g(k) *[U] (f / g)(k)       ... @6.4
 *      = k -> g(k) *[U] (f[k] /[U] g(k)) ... @6.5, β
 *      = k -> f(k) *[U] (g[k] /[U] f(k)) ... @4.5
 *      = f * (k -> g[k] /[U] f(k))       ... @6.4
 *      = f * (g / f)                     ... @6.5
 *
 * Record document
 * In practical, it's hard to define a serializable power document.
 *    > It requires a serializable pure function language. We may use a dialect
 *    > of Lisp, but due to the undecidability of The Halting Problem, this is
 *    > not a secure solution. One endpoint would easily post an unterminatable
 *    > operation and kill all the collaborating endpoints.
 * A more practical document model is the Record document, which is a restricted
 * power document, with K being the string type, and return none-ι[U] operations
 * on a finite subset of K.
 */

export const recordDocument = <U>({
  idn,
  inv,
  equ,
  comp,
  tran,
}: DocumentMeta<U>): DocumentMeta<Record<string, U>> => {
  const getIdn = () => idn;
  const getEqu = () => equ;
  const getInv = () => inv;
  const getComp = () => comp;
  const getTran = () => tran;
  const liftUo = structLiftUnaryOperator(getIdn)(getEqu);
  const liftPbo = structLiftPartialBinaryOperator(getIdn)(getEqu);

  return {
    idn: {},
    inv: liftUo(getInv),
    comp: liftPbo(getComp),
    tran: liftPbo(getTran),
    equ: structLiftEqu(getIdn)(getEqu),
  };
};
