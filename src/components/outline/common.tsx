import { uuid } from '@base/atom';
import { exampleSourceData } from '../mind-map/MindMap';

const TextAreaPrefix = uuid();
export function getTextAreaId(id: string) {
  return TextAreaPrefix + '-' + id;
}

export const INDENT = 24;

export function focusTextArea(id: string, at?: number) {
  const textarea = document.getElementById(getTextAreaId(id)) as HTMLTextAreaElement;
  if (!textarea) return;
  textarea.focus();
  const total = textarea.value.length;
  if (at === undefined) at = total;
  else if (at < 0) at = total + at;
  textarea.setSelectionRange(at, at);
}

export function mockFromSampleData() {
  interface Node {
    id: string;
    payload: { content: string };
    children?: Node[];
  };

  const all: Record<string, { id: string; payload: { content: string }; children?: string[] }> = {};
  const child2Parent: Record<string, string> = {};

  const handle = (node: Node, parent: string) => {
    const { id, payload: { content }, children } = node;
    all[id] = {
      id,
      payload: { content },
      children: children?.map((c) => {
        handle(c, id);
        return c.id;
      }),
    };
    child2Parent[id] = parent;
  };

  const RootId = exampleSourceData.id;
  exampleSourceData.children?.forEach(c => handle(c, RootId));
  all[RootId] = {
    id: RootId,
    payload: exampleSourceData.payload,
    children: exampleSourceData.children?.map(c => c.id),
  };

  return { all, child2Parent, RootId };
}
