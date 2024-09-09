import { NodeInterface } from '../interface';

export default function layout<T>(root: T): NodeInterface<T> {
  // todo
  return {
    id: 'root',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    depth: 0,
    vgap: 0,
    hgap: 0,
    children: [],
    collapsed: false,
    inSize: { width: 0, height: 0 },
    data: root,
    nodes() {
      return [];
    },
    links() {
      return [];
    },
  };
}
