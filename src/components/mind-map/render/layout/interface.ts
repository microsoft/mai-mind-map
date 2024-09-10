export interface NodeInterface<T> {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  vgap: number;
  hgap: number;
  children: NodeInterface<T>[];
  collapsed: boolean;
  inSize: { width: number; height: number };
  side?: 'left' | 'right';
  parent?: NodeInterface<T>;
  data: T;
  nodes(): Iterable<NodeInterface<T>>;
  links(): NodeLink<T>[];
  touchedLinks(): NodeLink<T>[];
  isRoot(): boolean;
  draggingX?: number;
  draggingY?: number;
}

export interface NodeLink<T> {
  source: NodeInterface<T>;
  target: NodeInterface<T>;
}
