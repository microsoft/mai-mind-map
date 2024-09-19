import { isArray, isString } from "lodash";
import { MindMapCp } from "./mind-map-model";

export type ListItem = {
  title: string;
  id: string;
};

export async function listDocuments(): Promise<ListItem[]> {
  const res = await fetch('/api/list');
  const data = await res.json();

  if (isArray(data.list)) {
    return data.list.reduce((m: ListItem[], item: any) => {
      if (isString(item.doc_id)) {
        m.push({ title: item.content?.v ?? "", id: item.doc_id });
      }
      return m;
    }, [] as ListItem[]);
  }
  return [];
}
