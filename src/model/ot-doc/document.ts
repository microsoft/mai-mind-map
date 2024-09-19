import { Constant, PartialBinaryOperator, PartialUnaryOperator, Relation, UnaryOperator } from "./algebra";

export type $Init<Cp> = {
  initial: Constant<Cp>;
};

export const $init = <Cp>(cp: Cp): $Init<Cp> => ({ initial: () => cp });

export type $Comp<Cp, Op> = {
  compose: (op: Op) => PartialUnaryOperator<Cp>;
};

export type $Inv<Op> = {
  invert: UnaryOperator<Op>;
};

export type $Idn<Op> = {
  identity: Constant<Op>;
};

export const $idn = <Op>(op: Op): $Idn<Op> => ({ identity: () => op });

export type $Tran<Op> = {
  transform: PartialBinaryOperator<Op>;
};

export type $BaseDoc<Cp, Op> = $Init<Cp> & $Idn<Op> & $Comp<Cp, Op> & {
  cpEquals: Relation<Cp>;
  opEquals: Relation<Op>;
};

export type $InvDoc<Cp, Op> = $BaseDoc<Cp, Op> & $Inv<Op>;

export type $FullDoc<Cp, Op> = $InvDoc<Cp, Op> & $Tran<Op>;
