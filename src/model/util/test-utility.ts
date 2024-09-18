import { BinaryOperator, PartialBinaryOperator } from "../ot-doc/algebra";
import { DocumentMeta } from "../ot-doc/document-meta";

const liftPartialBinaryOperator =
  <G>(pbo: PartialBinaryOperator<G>): BinaryOperator<G | undefined> =>
  (a) =>
  (b) =>
    a === undefined || b === undefined ? undefined : pbo(a)(b);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const opToString = (op: any) => JSON.stringify(op, (key, value) => {
  if (value === Infinity) {
    return { v: 'Infinity' };
  }
  if (value === -Infinity) {
    return { v: '-Infinity' };
  }
  return value;
});

export type DocumentTestCases<G> = Partial<{
  singleton: G[];
  composable3: [G, G, G][];
  incomposable: [G, G][];
  transformable: [G, G][];
  untransformable: [G, G][];
  others: (meta: DocumentMeta<G>) => void;
}>;

const verifyIdnP1 =
  <G>({ comp, idn, equ }: DocumentMeta<G>) =>
  (op: G) =>
    it(`conforms to idnP1: ${opToString(op)}`, () => {
      const a1 = comp(op)(idn);
      const a2 = comp(idn)(op);

      expect(a1 !== undefined && equ(a1)(op)).toBeTruthy();
      expect(a2 !== undefined && equ(a2)(op)).toBeTruthy();
    });

const verifyIdnP2 =
  <G>({ tran, idn, equ }: DocumentMeta<G>) =>
  (op: G) =>
    it(`conforms to idnP2: ${opToString(op)}`, () => {
      const a1 = tran(op)(idn);
      const a2 = tran(idn)(op);

      expect(a1 !== undefined && equ(a1)(op)).toBeTruthy();
      expect(a2 !== undefined && equ(a2)(idn)).toBeTruthy();
    });

const verifyInvP1 =
  <G>({ comp, equ, inv, idn }: DocumentMeta<G>) =>
  (op: G) =>
    it(`conforms to invP1: ${opToString(op)}`, () => {
      const $comp = liftPartialBinaryOperator(comp);
      const a1 = $comp(op)(inv(op));
      const a2 = $comp(inv(op))(op);
      expect(a1 !== undefined && equ(a1)(idn)).toBeTruthy();
      expect(a2 !== undefined && equ(a2)(idn)).toBeTruthy();
    });


const verifyAsscP =
  <G>({ comp, equ }: DocumentMeta<G>) =>
  ([a, b, c]: [G, G, G]) => {
    const $comp = liftPartialBinaryOperator(comp);
    const d1 = $comp($comp(a)(b))(c);
    it(`conforms to asscP: ${opToString([a, b, c])} -> ${opToString(
      d1
    )}`, () => {
      const d2 = $comp(a)($comp(b)(c));
      expect(
        (d1 === undefined && d2 === undefined) ||
          (d1 !== undefined && d2 !== undefined && equ(d1)(d2))
      ).toBeTruthy();
    });
  };

const verifyCnvP1 =
  <G>({ comp, tran, equ }: DocumentMeta<G>) =>
  ([a, b]: [G, G]) => {
    const $comp = liftPartialBinaryOperator(comp);
    const $tran = liftPartialBinaryOperator(tran);
    const c1 = $comp(a)($tran(b)(a));

    it(`conforms to cnvP1: ${opToString([a, b])} -> ${opToString(c1)}`, () => {
      const c2 = $comp(b)($tran(a)(b));
      expect(c1 !== undefined && c2 !== undefined && equ(c1)(c2)).toBeTruthy();
    });
  }

const verifyIncomp =
  <G>({ comp }: DocumentMeta<G>) =>
  ([a, b]: [G, G]) =>
    it(`should be incomposible: ${opToString([a, b])}`, () => {
      expect(comp(a)(b)).toBeUndefined();
    });

const verifyUntran =
  <G>({ tran }: DocumentMeta<G>) =>
  ([a, b]: [G, G]) =>
    it(`should be untransformable: ${opToString([a, b])}`, () => {
      expect(tran(a)(b)).toBeUndefined();
    });

export const describeDocumentMeta = <G>(
  name: string,
  meta: DocumentMeta<G>,
  {
    singleton,
    composable3,
    incomposable,
    transformable,
    untransformable,
    others,
  }: DocumentTestCases<G>
) =>
  describe(`[Document] ${name}`, () => {
    singleton?.forEach(verifyIdnP1(meta));
    singleton?.forEach(verifyIdnP2(meta));
    singleton?.forEach(verifyInvP1(meta));
    composable3?.forEach(verifyAsscP(meta));
    incomposable?.forEach(verifyIncomp(meta));
    transformable?.forEach(verifyCnvP1(meta));
    untransformable?.forEach(verifyUntran(meta));
    others?.(meta);
  });
