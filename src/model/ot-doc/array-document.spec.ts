import { describeDocumentMeta, DocumentTestCases } from "../util/test-utility";
import { arrayDocument, deleteAt, insertAt, ArrayOplet, compact } from "./array-document";

const arrNum = arrayDocument<number>();

describeDocumentMeta('arrayDocument<number>', arrNum, {
  singleton: [
    [],
    insertAt(0, 1),
    deleteAt(0, 1),
    [...deleteAt(0, 1), ...insertAt(1, 2)],
    [...insertAt(1, 2), ...deleteAt(0, 1)],
  ],
  composable3: [
    [
      [],
      [...insertAt(1, 2), ...deleteAt(0, 1)],
      [...deleteAt(0, 2), ...insertAt(1, 2)],
    ],
    [
      [...insertAt(1, 2), ...deleteAt(0, 1)],
      [],
      [...deleteAt(0, 2), ...insertAt(1, 2)],
    ],
    [
      [...insertAt(1, 2), ...deleteAt(0, 1)],
      [...deleteAt(0, 2), ...insertAt(1, 2)],
      [],
    ],
    [
      insertAt(0, 1, 2, 3),
      insertAt(1, 4, 5),
      insertAt(3, 6),
    ],
    [
      insertAt(0, 0, 1, 2, 3),
      deleteAt(2, 2, 3),
      deleteAt(0, 0),
    ],
  ],
  others({ comp, inv }) {
    // const a: Oplet<number>[] = [{ typ: 'ins', idx: 1, val: 2}, { typ: 'del', idx: 0, val: 1 }];
    // const b = inv(a);
    // console.log(JSON.stringify(a));
    // console.log(JSON.stringify(b));
    // const a_b = comp(a)(b);
    // console.log(JSON.stringify(a_b));
    // const b_a = comp(b)(a);
    // console.log(JSON.stringify(b_a));
  },
} as DocumentTestCases<ArrayOplet<number>[]>);


const compactArrayNum = compact(arrNum);
describeDocumentMeta('CompactArrayOp<number>', compactArrayNum, {
  singleton: [
    {},
    {
      ins: [
        { idx: 0, arr: [1, 2, 3] },
        { idx: 3, arr: [4, 5] },
      ],
    },
    {
      del: [
        { idx: 3, arr: [4, 5] },
        { idx: 0, arr: [1, 2, 3] },
      ],
    },
    {
      del: [
        { idx: 3, arr: [4, 5] },
        { idx: 0, arr: [1, 2, 3] },
      ],
      ins: [
        { idx: 0, arr: [5, 4, 3] },
        { idx: 3, arr: [2, 1] },
      ],
    },
  ],
});