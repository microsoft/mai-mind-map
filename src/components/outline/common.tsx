import { uuid } from '@base/atom';

import { Payload } from '@root/components/mind-map/render/model/interface';
import { RawNode } from '@root/components/mind-map/render/node/interface';

const TextAreaPrefix = uuid();
export function getTextAreaId(id: string) {
  return TextAreaPrefix + '-' + id;
}

export const INDENT = 24;

export function focusTextArea(id: string, at?: number) {
  const textarea = document.getElementById(
    getTextAreaId(id),
  ) as HTMLTextAreaElement;
  if (!textarea) return;
  textarea.focus();
  const total = textarea.value.length;
  if (at === undefined) at = total;
  else if (at < 0) at = total + at;
  textarea.setSelectionRange(at, at);
}

export interface OutlineNode {
  id: string;
  payload: Payload;
  children?: string[];
}

export function handleSourceData(sourceData: RawNode<Payload>) {
  const all: Record<string, OutlineNode> = {};
  const child2Parent: Record<string, string> = {};

  const handle = (node: RawNode<Payload>, parent: string) => {
    const { id, children } = node;
    all[id] = {
      id,
      payload: Object.assign({}, node.payload),
      children: children?.map((c) => {
        handle(c, id);
        return c.id;
      }),
    };
    child2Parent[id] = parent;
  };

  const RootId = sourceData.id;
  sourceData.children?.forEach((c) => handle(c, RootId));
  all[RootId] = {
    id: RootId,
    payload: sourceData.payload,
    children: sourceData.children?.map((c) => c.id),
  };
  console.log('all', all);
  return { all, child2Parent, RootId };
}
