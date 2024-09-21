import { MindMapCp, MindMapNodeProps } from '@root/model/mind-map-model';
import { Rec, mapRec } from '@root/model/ot-doc/record';
import { Timestamped } from '@root/model/ot-doc/timestamped';
import { Payload, RawNode } from '../mind-map/render';

const ROOT_ID = '00000000';

const node = (
  id: string,
  payload: Payload = { content: '', collapsed: false },
): RawNode<Payload> => ({ id, payload });

export function cpToTree(cp: MindMapCp): RawNode<Payload> {
  const nodes: Rec<RawNode<Payload>> = {};
  const parents: Rec<Timestamped<string>> = {
    [ROOT_ID]: { t: Number.POSITIVE_INFINITY, v: ROOT_ID },
  };
  const childrenIds: Rec<string[]> = {};
  const dfs = (id: string) => {
    const { children = [], stringProps, booleanProps } = cp[id] ?? {};
    nodes[id] ??= node(
      id,
      propsToPayload({
        stringProps: mapRec(stringProps ?? {}, ({ v }) => v),
        booleanProps: mapRec(booleanProps ?? {}, ({ v }) => v),
      }),
    );
    childrenIds[id] = [];
    for (const { t, v: idC } of children) {
      if (parents[idC]) {
        if (parents[idC].t < t) {
          parents[idC] = { t, v: id };
        }
      } else {
        parents[idC] = { t, v: id };
        childrenIds[id].push(idC);
        dfs(idC);
      }
    }
  };
  dfs(ROOT_ID);

  for (const id in nodes) {
    const node = nodes[id];
    node.children = childrenIds[id]
      .filter((idC) => parents[idC]?.v === id)
      .map((idC) => nodes[idC]);
  }

  return nodes[ROOT_ID] ?? node(ROOT_ID);
}

export function treeToCp(tree: RawNode<Payload>): MindMapCp {
  const cp: MindMapCp = {};
  const t = Date.now();
  const visited = new Set<string>();
  const dfs = (node: RawNode<Payload>) => {
    const id = node === tree ? ROOT_ID : node.id;
    visited.add(id);
    const { stringProps = {}, booleanProps = {} } = payloadToProps(
      node.payload,
    );
    cp[id] = {
      children: [],
      stringProps: mapRec(stringProps, (v) => ({ t, v })),
      booleanProps: mapRec(booleanProps, (v) => ({ t, v })),
    };
    // biome-ignore lint/complexity/noForEach: <explanation>
    node.children?.forEach((nodeC) => {
      if (!visited.has(nodeC.id)) {
        cp[id].children?.push({ t, v: nodeC.id });
        dfs(nodeC);
      }
    });
  };

  dfs(tree);
  return cp;
}

export const payloadToProps = (payload: Payload): MindMapNodeProps => ({
  stringProps: {
    content: payload.content,
    link: payload.link ?? '',
    hilight: payload.hilight ?? '',
  },
  booleanProps: {
    collapsed: payload.collapsed ?? false,
    bold: payload.bold ?? false,
    italic: payload.italic ?? false,
    underline: payload.underline ?? false,
  },
});

export const propsToPayload = (props: MindMapNodeProps): Payload => ({
  content: props.stringProps?.content ?? '',
  link: props.stringProps?.link,
  hilight: props.stringProps?.hilight,
  collapsed: props.booleanProps?.collapsed,
  bold: props.booleanProps?.bold,
  italic: props.booleanProps?.italic,
  underline: props.booleanProps?.underline,
});
