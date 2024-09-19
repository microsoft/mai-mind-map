import { MindMapCp } from "@root/model/mind-map-model";
import { Payload, RawNode } from "../mind-map/render";
import { Rec } from "@root/model/ot-doc/record";
import { Timestamped } from "@root/model/ot-doc/timestamped";

const ROOT_ID = "00000000";

const node = (
  id: string,
  content = "",
  collapsed = false
): RawNode<Payload> => ({ id, payload: { content, collapsed } });

export function cpToTree(cp: MindMapCp): RawNode<Payload> {
  const nodes: Rec<RawNode<Payload>> = {};
  const parents: Rec<Timestamped<string>> = {
    [ROOT_ID]: { t: Infinity, v: ROOT_ID },
  };
  const childrenIds: Rec<string[]> = {}; 
  const dfs = (id: string) => {
    const {
      children = [],
      stringProps,
      booleanProps,
    } = cp[id] ?? {};
    nodes[id] ??= node(
      id,
      stringProps?.content?.v ?? "",
      booleanProps?.collapsed?.v ?? false
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
    cp[id] = {
      children: [],
      stringProps: {
        content: { t, v: node.payload.content },
      },
      booleanProps: {
        collapsed: { t, v: node.payload.collapsed ?? false },
      },
    };
    node.children?.forEach(nodeC => {
      if (!visited.has(nodeC.id)) {
        cp[id].children?.push({ t, v: nodeC.id });
        dfs(nodeC);
      }
    });
  };

  dfs(tree);
  return cp;
}
