import { Eq, PartialBinaryOperator, UnaryOperator } from "./algebra";

/**
 * A document is defined over a set of operations T, with the following
 * structure
 *  - Identity operation as an element, denoted by `idn` or (ι) in math
 *  - Inverse as a unary operator, denoted by `inv` or (!) in math
 *  - Compose as a partial binary operator, denoted by `comp` or (*) in math
 *  - Transform as a partial binary operator, denoted by `tran` or (/) in math
 * With the following properties
 *    @4.1 [IdnP1] Identity Property 1
 *        ∀ a ∈ T
 *          → <ι, a>, <a, ι> ∈ Dom(*)
 *          ∧ ι * a = a
 *          ∧ a * ι = a
 *    @4.2 [IdnP2] Identity Property 2
 *        ∀ a ∈ T
 *          → <ι, a>, <a, ι> ∈ Dom(/)
 *          ∧ ι / a = ι
 *          ∧ a / ι = a
 *    @4.3 [InvP1] Inverse Property 1
 *        ∀ a ∈ T
 *          → <a, !a>, <!a, a> ∈ Dom(*)
 *          ∧ a * !a = ι
 *          ∧ !a * a = ι
 *    @4.4 [AsscP] Associative Property
 *        ∀ a, b, c ∈ T, <a, b>, <b, c> ∈ Dom(*)
 *          → <a * b, c>, <a, b * c> ∉ Dom(*)
 *          ∨ <a * b, c>, <a, b * c> ∈ Dom(*)
 *          ∧ (a * b) * c = a * (b * c)
 *    @4.5 [CnvP1] Convergence Property 1
 *        ∀ a, b ∈ T, <a, b> ∈ Dom(/)
 *          → <b, a> ∈ Dom(/)
 *          ∧ <a, b / a>, <b, a / b> ∈ Dom (*)
 *          ∧ a * (b / a) = b * (a / b)
 * There are more properties, which are not required by COT (context-based
 * operational transformation) algorithms.
 *    @4.6 [InvP2] Inverse Property 2
 *        ∀ a, b ∈ T, <a, b> ∈ Dom(/)
 *          → <a / b, !b> ∈ Dom(/)
 *          ∧ a / b / !b = a
 *    The requirement for InvP2 is a little bit tricky. If our document model
 *    doesn't conform to InvP2, we must make sure all endpoints transform all
 *    operations one by one. No composed operations are used in transformation.
 *    Otherwise, the convergence would be broken.
 *    One of the commonly used document model, Greater Write Wins (Indeed, Last
 *    Write Wins, which is a special case of GWW, is the most used model) does
 *    not conform to InvP2. Fortunately, the COT algorithm don't transform
 *    composed operations. That means, GWW, LWW can be used with COT system.
 *
 *    @4.7 [InvP3] Inverse Property 3
 *        ∀ a, b ∈ T, <a, b> ∈ Dom(/)
 *          → <b, a>, <!a, b / a> ∈ Dom(/)
 *          ∧ !a / (b / a) = !(a / b)
 *    @4.8 [CnvP2] Convergence Property 2
 *        ∀ a, b, c ∈ T, <a, b> ∈ Dom(/), <a, c> ∈ Dom(/)
 *          → <a / b, c / b>, <a / c, b / c>, <b, c>, <c, b> ∈ Dom(/)
 *          ∧ (a / b) / (c / b) = (a / c) / (b / c)
 */

export type DocumentMeta<T> = Eq<T> & {
  idn: T;
  inv: UnaryOperator<T>;
  comp: PartialBinaryOperator<T>;
  tran: PartialBinaryOperator<T>;
};

export type OpType<T> = T extends DocumentMeta<infer O> ? O : never;

export type CheckpointMeta<Op, Cp> = {
  cpToOp: (cp: Cp) => Op | undefined;
  opToCp: (op: Op) => Cp | undefined;
};
