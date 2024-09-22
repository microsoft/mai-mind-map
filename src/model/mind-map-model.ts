import { $eqPrime } from './ot-doc/algebra';
import { $invDocArr, ArrayOp, ArrayOplet } from './ot-doc/array';
import { $InvDoc } from './ot-doc/document';
import { $fullDocRecord, $invDocRecord, Rec, mapRec } from './ot-doc/record';
import { Update } from './ot-doc/singleton';
import { $invDocStruct } from './ot-doc/struct';
import {
  $eqTimestamped,
  $fullDocLwwBoolean,
  $fullDocLwwNumber,
  $fullDocLwwString,
  Timestamped,
} from './ot-doc/timestamped';

export type MindMapNodeProps = Partial<{
  stringProps: Rec<string>;
  numberProps: Rec<number>;
  booleanProps: Rec<boolean>;
}>;

export type MindMapNodeCp = Partial<{
  stringProps: Rec<Timestamped<string>>;
  numberProps: Rec<Timestamped<number>>;
  booleanProps: Rec<Timestamped<boolean>>;
  children: Timestamped<string>[];
}>;

export type MindMapCp = Rec<MindMapNodeCp>;

export type MindMapNodeOp = Partial<{
  children: ArrayOp<Timestamped<string>>;
  stringProps: Rec<Update<Timestamped<string>>>;
  numberProps: Rec<Update<Timestamped<number>>>;
  booleanProps: Rec<Update<Timestamped<boolean>>>;
}>;

export type MindMapOp = Rec<MindMapNodeOp>;

export const $invDocMindMap: $InvDoc<MindMapCp, MindMapOp> = $invDocRecord(
  $invDocStruct({
    children: $invDocArr<Timestamped<string>>(
      $eqTimestamped($eqPrime<string>()),
    ),
    stringProps: $fullDocRecord($fullDocLwwString),
    numberProps: $fullDocRecord($fullDocLwwNumber),
    booleanProps: $fullDocRecord($fullDocLwwBoolean),
  }),
);

const iterateUntil =
  <T>(gen: () => T) =>
  (predict: (t: T) => boolean): T => {
    let val: T;
    do {
      val = gen();
    } while (!predict(val));
    return val;
  };

const genId = () => Math.random().toString(36).padEnd(10, '0').slice(2, 10);

export const add =
  (
    parentId: string,
    idx: number,
    { stringProps, numberProps, booleanProps }: MindMapNodeProps,
  ) =>
  (cur: MindMapCp): MindMapOp | undefined => {
    const t = Date.now();
    if (idx < 0 || idx > (cur[parentId]?.children ?? []).length)
      return undefined;
    const nodeId = iterateUntil(genId)((id) => !cur[id]);
    const nodeOp: MindMapNodeOp = {};
    if (stringProps)
      nodeOp.stringProps = mapRec(stringProps, (v) => ({
        f: $fullDocLwwString.initial(),
        t: { t, v },
      }));
    if (numberProps)
      nodeOp.numberProps = mapRec(numberProps, (v) => ({
        f: $fullDocLwwNumber.initial(),
        t: { t, v },
      }));
    if (booleanProps)
      nodeOp.booleanProps = mapRec(booleanProps, (v) => ({
        f: $fullDocLwwBoolean.initial(),
        t: { t, v },
      }));
    return {
      [nodeId]: nodeOp,
      [parentId]: {
        children: {
          ins: [{ idx, arr: [{ t, v: nodeId }] }],
        },
      },
    };
  };

export const remove =
  (nodeId: string) =>
  (cur: MindMapCp): MindMapOp | undefined => {
    if (!cur[nodeId]) return undefined;
    const { stringProps, numberProps, booleanProps } = cur[nodeId];
    const nodeOp = {} as MindMapNodeOp;

    if (stringProps)
      nodeOp.stringProps = mapRec(stringProps, (f) => ({
        f,
        t: $fullDocLwwString.initial(),
      }));
    if (numberProps)
      nodeOp.numberProps = mapRec(numberProps, (f) => ({
        f,
        t: $fullDocLwwNumber.initial(),
      }));
    if (booleanProps)
      nodeOp.booleanProps = mapRec(booleanProps, (f) => ({
        f,
        t: $fullDocLwwBoolean.initial(),
      }));

    const op: MindMapOp = { [nodeId]: nodeOp };

    // biome-ignore lint/complexity/noForEach: <explanation>
    Object.keys(cur).forEach((key) => {
      const { children = [] } = cur[key];
      const del = children.reduce(
        (m, { t, v }, idx) => {
          if (v === nodeId) m.unshift({ idx, arr: [{ t, v }] });
          return m;
        },
        [] as ArrayOplet<Timestamped<string>>[],
      );
      if (del.length > 0) {
        op[key] ??= {};
        op[key].children = { del };
      }
    });

    return op;
  };

export const modify =
  (nodeId: string, updater: (props: MindMapNodeProps) => MindMapNodeProps) =>
  (cur: MindMapCp): MindMapOp | undefined => {
    const t = Date.now();
    const {
      stringProps: strPropsCur = {},
      numberProps: numPropsCur = {},
      booleanProps: boolPropsCur = {},
    } = cur[nodeId] || {};
    const { stringProps, numberProps, booleanProps } = updater({
      stringProps: mapRec(strPropsCur, ({ v }) => v),
      numberProps: mapRec(numPropsCur, ({ v }) => v),
      booleanProps: mapRec(boolPropsCur, ({ v }) => v),
    });
    const nodeOp: MindMapNodeOp = {};
    if (stringProps)
      nodeOp.stringProps = mapRec(stringProps, (v, key) => ({
        f: strPropsCur[key] ?? $fullDocLwwString.initial(),
        t: { t, v },
      }));
    if (numberProps)
      nodeOp.numberProps = mapRec(numberProps, (v, key) => ({
        f: numPropsCur[key] ?? $fullDocLwwNumber.initial(),
        t: { t, v },
      }));
    if (booleanProps)
      nodeOp.booleanProps = mapRec(booleanProps, (v, key) => ({
        f: boolPropsCur[key] ?? $fullDocLwwBoolean.initial(),
        t: { t, v },
      }));
    return { [nodeId]: nodeOp };
  };

export const move =
  (nodeId: string, parentId: string, idx: number) =>
  (cur: MindMapCp): MindMapOp | undefined => {
    const t = Date.now();
    if (idx < 0 || idx > (cur[parentId]?.children ?? []).length)
      return undefined;

    const op: MindMapOp = {};

    // biome-ignore lint/complexity/noForEach: <explanation>
    Object.keys(cur).forEach((key) => {
      const { children = [] } = cur[key];
      const del = children.reduce(
        (m, { t, v }, i) => {
          if (v === nodeId) {
            m.unshift({ idx: i, arr: [{ t, v }] });
            // biome-ignore lint/style/noParameterAssign: <explanation>
            if (parentId === key && i < idx) idx -= 1;
          }
          return m;
        },
        [] as ArrayOplet<Timestamped<string>>[],
      );
      if (del.length > 0) {
        op[key] ??= {};
        op[key].children = { del };
      }
    });

    op[parentId] ??= {};
    op[parentId].children ??= {};
    (op[parentId].children as ArrayOp<Timestamped<string>>).ins = [
      {
        idx,
        arr: [{ t, v: nodeId }],
      },
    ];

    return op;
  };
