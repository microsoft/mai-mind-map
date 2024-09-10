import { NodeInterface, NodeLink } from '../interface';

/**
 * LR: left to right
 * RL: right to left
 * TB: top to bottom
 * BT: bottom to top
 * H: horizontal
 * V: vertical
 */
export type HDirection = 'LR' | 'RL' | 'H';
export type Direction = HDirection | 'TB' | 'BT' | 'V';

export interface BaseNodeInfo {
  id: string;
  size: { width: number; height: number };
  pre?: { h: number; v: number };
  padding?: { h: number; v: number };
  collapsed?: boolean;
}

export interface HierarchyOptions<T> {
  isHorizontal?: boolean;
  radial?: boolean;
  fixedRoot?: boolean;
  direction: Direction;

  getSide?: (d: Node<T>, i: number) => 'left' | 'right';
  getInfo: (d: T) => BaseNodeInfo;
  getChildren: (d: T) => T[] | undefined;
}

export class Node<T> implements NodeInterface<T> {
  public id: string;
  public x = 0;
  public y = 0;
  public width = 0;
  public height = 0;
  public depth = 0;
  public vgap = 0;
  public hgap = 0;
  public children: Node<T>[] = [];
  public collapsed: boolean;
  public inSize: { width: number; height: number };
  public side?: 'left' | 'right';
  public parent?: Node<T>;

  private preH: number;
  private preV: number;

  constructor(public data: T, options: HierarchyOptions<T>) {
    /*
     * Gaps: filling space between nodes
     * (x, y) ----------------------
     * |            vgap            |
     * |    --------------------    h
     * | h |                    |   e
     * | g |                    |   i
     * | a |                    |   g
     * | p |                    |   h
     * |   ---------------------    t
     * |                            |
     *  -----------width------------
     */
    const { id, size, padding, pre, collapsed = false } = options.getInfo(data);

    this.id = id;
    this.preH = pre?.h || 0;
    this.preV = pre?.v || 0;
    this.inSize = size;
    this.width = size.width;
    this.height = size.height;
    this.width += this.preH;
    this.height += this.preV;
    this.collapsed = collapsed;
    this.setGap(padding?.h || 0, padding?.v || 0);
  }

  public isRoot() {
    return this.depth === 0;
  }

  public isLeaf() {
    return this.children.length === 0;
  }

  private setGap(hgap: number, vgap: number) {
    this.hgap += hgap;
    this.vgap += vgap;
    this.width += 2 * hgap;
    this.height += 2 * vgap;
  }

  private eachNode(
    callback: (node: Node<T>) => void,
    type: 'df' | 'bf' = 'df',
  ) {
    let nodes: Node<T>[] = [this];
    let current: Node<T> | undefined;
    // Todo: don't use shift
    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    while ((current = nodes.shift())) {
      callback(current);
      if (current.children.length === 0) continue;
      if (type === 'df') {
        nodes = current.children.concat(nodes);
      } else {
        nodes = nodes.concat(current.children);
      }
    }
  }

  // Depth first traverse
  public DFTraverse(callback: (node: Node<T>) => void) {
    this.eachNode(callback, 'df');
  }

  // Breadth first traverse
  public BFTraverse(callback: (node: Node<T>) => void) {
    this.eachNode(callback, 'bf');
  }
  public nodes() {
    const nodes: Node<T>[] = [];
    this.BFTraverse((node) => {
      nodes.push(node);
    });
    return nodes;
  }

  public links() {
    const links: { source: Node<T>; target: Node<T> }[] = [];
    this.BFTraverse((node) => {
      if (node.parent) {
        links.push({ source: node.parent, target: node });
      }
    });
    return links;
  }
  public touchedLinks() {
    const links: NodeLink<T>[] = [];
    if (this.parent) {
      links.push({ source: this.parent, target: this });
    }
    if (this.children?.length > 0) {
      for (let i = 0; i < this.children.length; i++) {
        links.push({ source: this, target: this.children[i] });
      }
    }
    return links;
  }

  // position helper functions
  public get right() {
    return this.x + this.width;
  }
  public get botton() {
    return this.y + this.height;
  }
  public center() {
    const { x, y, width, height } = this;
    return { x: width / 2 + x, y: height / 2 + y };
  }

  public contentBox(paddingH = 0, paddingV = paddingH) {
    const { x, y, width, height, inSize } = this;
    return {
      x: (width - inSize.width) / 2 + x - paddingH,
      y: (height - inSize.height) / 2 + y - paddingV,
      width: paddingH * 2 + inSize.width,
      height: paddingV * 2 + inSize.height,
    };
  }

  public getBoundingBox() {
    const box = {
      left: Number.MAX_VALUE,
      top: Number.MAX_VALUE,
      width: 0,
      height: 0,
    };
    this.eachNode((node) => {
      box.left = Math.min(box.left, node.x);
      box.top = Math.min(box.top, node.y);
      box.width = Math.max(box.width, node.x + node.width);
      box.height = Math.max(box.height, node.y + node.height);
    });
    return box;
  }

  public translate(tx = 0, ty = 0) {
    this.eachNode((node) => {
      node.x += tx;
      node.y += ty;
      node.x += node.preH;
      node.y += node.preV;
    });
  }

  public right2left() {
    const bb = this.getBoundingBox();
    this.eachNode((node) => {
      node.x = node.x - (node.x - bb.left) * 2 - node.width;
    });
    this.translate(bb.width, 0);
  }

  public bottom2top() {
    const bb = this.getBoundingBox();
    this.eachNode((node) => {
      node.y = node.y - (node.y - bb.top) * 2 - node.height;
    });
    this.translate(0, bb.height);
  }
}

function hierarchy<T>(
  data: T,
  options: HierarchyOptions<T>,
  isolated?: boolean,
) {
  const root = new Node(data, options);
  const nodes = [root];
  let node: Node<T> | undefined;
  if (!isolated && !root.collapsed) {
    // Todo: optimize shift
    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    while ((node = nodes.shift())) {
      if (node.collapsed) continue;
      const children = options.getChildren(node.data);
      const length = children ? children.length : 0;
      // need to create an array with valid length here
      node.children = new Array(length);
      if (!children || children.length === 0) continue;
      for (let i = 0; i < length; i++) {
        const child = new Node(children[i], options);
        node.children[i] = child;
        nodes.push(child);
        child.parent = node;
        child.depth = node.depth + 1;
      }
    }
  }
  return root;
}

export default hierarchy;
