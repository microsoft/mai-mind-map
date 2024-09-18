import { gwwDocument, Gww } from './gww-document';
import { DocumentTestCases, describeDocumentMeta } from '../util/test-utility';

const gwwNumber = (digits: number) =>
  gwwDocument<number>({
    lt: (a) => (b) => a < b,
    equ: (a) => (b) => a.toFixed(digits) === b.toFixed(digits),
  });

const gwwNum10 = gwwNumber(10);

const gwwComp3 = <S>(a: S, b: S, c: S, d: S): [Gww<S>, Gww<S>, Gww<S>] => [
  [a, b],
  [b, c],
  [c, d],
];

describeDocumentMeta('Gww<number> with 10 digits precision', gwwNum10, {
  singleton: [null, [1, 3], [2, 2], [0.1, -0.00000001]],
  composable3: [
    [null, [1, 3], [3, -0.00000001]],
    [[1, 3], null, [3, 2]],
    [[1, 3], null, [2, 1]],
    [[1, 3], [3, -0.00000001], null],
    [
      [1, 1],
      [2, 3],
      [3, 2],
    ],
    gwwComp3(1, 2, 3, 4),
    gwwComp3(1, 2, -0.00000001, 4),
  ],
  incomposable: [
    [
      [1, 2],
      [3, 4],
    ],
  ],
  transformable: [
    [
      [1, 2],
      [1, 3],
    ],
    [
      [1, 2],
      [1, 2],
    ],
    [
      [1, Infinity],
      [1, 2],
    ],
    [
      [1, 1],
      [2, 3],
    ],
    [
      [1, 2],
      [2, 2],
    ],
    [
      [1, Infinity],
      [1, Infinity],
    ],
    [
      [Infinity, 1],
      [Infinity, 2],
    ],
  ],
  untransformable: [
    [
      [1, 2],
      [2, 3],
    ],
    [
      [1, Infinity],
      [-Infinity, 3],
    ],
  ],
} as DocumentTestCases<Gww<number>>);
