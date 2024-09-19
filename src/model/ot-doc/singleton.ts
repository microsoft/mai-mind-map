import { $Eq, $Ord } from "./algebra";
import { $FullDoc, $idn, $Init, $InvDoc } from "./document";
import { just, nothing } from "./maybe";

// f: update from value
// t: update to value
export type Update<A> = { f: A, t: A } | null;

// Eq a => Eq (Update a)
export const $eqUpdate = <A>({ equals }: $Eq<A>): $Eq<Update<A>> => ({
  equals: (a) => (b) => {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return (equals(a.f)(b.f) && equals(a.t)(b.t))
  },
});

// Eq a, Initial a => $InvDoc a (Update a)
export const $invDocUpdate = <A>({
  equals,
  initial,
}: $Eq<A> & $Init<A>): $InvDoc<A, Update<A>> => ({
  initial,
  ...$idn(null),
  compose:
    (op) => op ? ((v) => equals(v)(op.f) ? just(op.t) : nothing()) : just,
  invert: op => op ? { f: op.t, t: op.f } : null,
  cpEquals: equals,
  opEquals: $eqUpdate({ equals }).equals,
});

// Greater Write Win
// Eq a, Initial a, Ord a => $FullDoc a (Update a)
export const $fullDocGww = <A>({
  equals,
  initial,
  lessThan,
}: $Eq<A> & $Init<A> & $Ord<A>): $FullDoc<A, Update<A>> => ({
  ...$invDocUpdate({ equals, initial }),
  transform: (opA) => (opB) => {
    if (!opA) return just(null);
    if (!opB) return just(opA);
    const { f: fA, t: tA } = opA;
    const { f: fB, t: tB } = opB;
    if (!equals(fA)(fB)) return nothing();
    return just(lessThan(tA)(tB) ? { f: tA, t: tB } : null);
  },
});

