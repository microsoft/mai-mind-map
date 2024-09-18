import { Ordered } from "./ot-doc/algebra";
import { arrayDocument } from "./ot-doc/array-document";
import { OpType } from "./ot-doc/document-meta";
import { gwwDocument } from "./ot-doc/gww-document";
import { recordDocument } from "./ot-doc/record-document";
import { structDocument } from "./ot-doc/struct-document";

type Timestamped<T> = { t: number, v: T };
const timestamped = <T>({ equ = (a) => (b) => a === b, lt = (a) => (b) => a < b }: Partial<Ordered<T>> = {}): Ordered<Timestamped<T>> => ({
  equ: (a) => (b) => a.t === b.t && equ(a.v)(b.v),
  lt: (a) => (b) => a.t < b.t || (a.t === b.t && lt(a.v)(b.v)),
});

export const mindMapMeta = recordDocument(structDocument({
  children: arrayDocument(timestamped<string>()),
  props: structDocument({
    string: recordDocument(gwwDocument(timestamped<string>())),
    number: recordDocument(gwwDocument(timestamped<number>())),
    boolean: recordDocument(gwwDocument(timestamped<boolean>())),
  }),
}));

export type MindMapOp = OpType<typeof mindMapMeta>;

export const add = (cur: MindMapOp) => (nodeId: string, parentId: string, text: string): MindMapOp | undefined => {
  return undefined;
};
