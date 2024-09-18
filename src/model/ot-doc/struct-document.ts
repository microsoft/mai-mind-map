import { structLiftEqu, structLiftPartialBinaryOperator, structLiftUnaryOperator } from "./algebra";
import { DocumentMeta } from "./document-meta";

/**
 * Product document
 * Given 2 document model with operation sets U and V, we can define a product
 * document model, on set U × V.
 *    @7.1 T:
 *      T := U × V
 *    @7.2 Idn:
 *      ι := <ι[U], ι[V]>
 *    @7.3 Inv:
 *      !<u, v> := <![U]u, ![V]v>
 *    @7.4 Comp:
 *      <u, v> * <u', v'> := <u *[U] u', v *[V] v'>
 *      Dom(*) = { <<u, v>, <u', v'>>
 *               | ∀ u, u' ∈ U , v, v' ∈ V
 *               , <u, u'> ∈ Dom<*[U]> ∧ <v, v'> ∈ Dom<*[V]> }
 *    @7.5 Tran:
 *      <u, v> / <u', v'> := <u /[U] u', v /[V] v'>
 *      Dom(/) = { <<u, v>, <u', v'>>
 *               | ∀ u, u' ∈ U , v, v' ∈ V
 *               , <u, u'> ∈ Dom</[U]> ∧ <v, v'> ∈ Dom</[V]> }
 * Prove:
 *    IdnP1 -
 *      ∀ <u, v> ∈ U × V
 *      ι * <u, v>  ={@7.2} <ι[U], ι[V]> * <u, v>
 *                  ={@7.4} <ι[U] *[U] u, ι[V] *[V] v>
 *                  ={@4.1} <u, v>
 *      <u, v> * ι  ={@7.2} <u, v> * <ι[U], ι[V]>
 *                  ={@7.4} <u *[U] ι[U], v *[V] ι[V]>
 *                  ={@4.1} <u, v>
 *    IdnP2 -
 *      ∀ <u, v> ∈ U × V
 *      ι / <u, v>  ={@7.2} <ι[U], ι[V]> / <u, v>
 *                  ={@7.5} <ι[U] /[U] u, ι[V] /[V] v>
 *                  ={@4.2} <ι[U], ι[V]>
 *                  ={@7.2} ι
 *      <u, v> / ι  ={@7.2} <u, v> / <ι[U], ι[V]>
 *                  ={@7.5} <u /[U] ι[U], v /[V] ι[V]>
 *                  ={@4.2} <u, v>
 *    InvP1 -
 *      ∀ <u, v> ∈ U × V
 *        <u, v> * !<u, v>                ...@7.3
 *      = <u, v> * <![U]u, ![V]v>         ...@7.4
 *      = <u *[U] ![U]u, v *[V] ![V]v>    ...@4.3
 *      = <ι[U], ι[V]>                    ...@7.2
 *      = ι
 *        !<u, v> * <u, v>                ...@7.3
 *      = <![U]u, ![V]v> * <u, v>         ...@7.4
 *      = <![U]u *[U] u, ![V]v *[V] v>    ...@4.3
 *      = <ι[U], ι[V]>                    ...@7.2
 *      = ι
 *    AsscP -
 *      ∀ u1, u2, u3 ∈ U, v1, v2, v3 ∈ V,
 *        <<u1, v1>, <u2, v2>>, <<u2, v2>, <u3, v3>> ∈ Dom(*)
 *        (<u1, v1> * <u2, v2>) * <u3, v3>              ...@7.4
 *      = <u1 *[U] u2, v1 *[V] v2> * <u3, v3>           ...@7.4
 *      = <(u1 *[U] u2) *[U] u3, (v1 *[V] v2) *[V] v3>  ...@4.4
 *      = <u1 *[U] (u2 *[U] u3), v1 *[V] (v2 *[V] v3)>  ...@4.4
 *      = <u1, v1> * <u2 *[U] u3, v2 *[V] v3>           ...@7.4
 *      = <u1, v1> * (<u2, v2> * <u3, v3>)
 *    CnvP1 -
 *      ∀ u, u' ∈ U, v, v' ∈ V, <<u, v>, <u', v'>> ∈ Dom(/)
 *        <u', v'> * (<u, v> / <u', v'>)
 *      = <u', v'> * <u /[U] u', v /[V] v'>
 *      = <u' *[U] (u /[U] u'), v' *[V] (v /[V] v')>
 *      = <u *[U] (u' /[U] u), v *[V] (v' /[V] v)>
 *      = <u, v> * <u' /[U] u, v' /[V] v>
 *      = <u, v> * (<u', v'> / <u, v>)
 *      
 */

type DocumentStruct<T extends Record<string, unknown>> = {
  [K in keyof T]: DocumentMeta<T[K]>;
};

export const structDocument = <T extends Record<string, unknown>>(struct: DocumentStruct<T>): DocumentMeta<Partial<T>> => {
  const getIdn = <K extends keyof T>(key: K) => struct[key].idn;
  const getEqu = <K extends keyof T>(key: K) => struct[key].equ;
  const getInv = <K extends keyof T>(key: K) => struct[key].inv;
  const getComp = <K extends keyof T>(key: K) => struct[key].comp;
  const getTran = <K extends keyof T>(key: K) => struct[key].tran;
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
