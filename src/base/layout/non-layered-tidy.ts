import { Node, HierarchyOptions } from  './hierarchy';

// wrap tree node
class WrappedTree {
  public x = 0;
  public cs: number;

  // modified
  public prelim = 0;
  public mod = 0;
  public shift = 0;
  public change = 0;

  // left/right tree
  public tl: WrappedTree | null = null;
  public tr: WrappedTree | null = null;

  // extreme left/right tree
  public el: WrappedTree | null = null;
  public er: WrappedTree | null = null;

  // modified left/right tree
  public msel = 0;
  public mser = 0;

  constructor(
    public w: number,
    public h: number,
    public y: number,
    public c: WrappedTree[] = [],
  ) {
    this.cs = c.length;
  }

  static fromNode<T>(root: Node<T>, isHorizontal?: boolean): WrappedTree {
    const children: WrappedTree[] = [];
    root.children.forEach((child) => {
      children.push(WrappedTree.fromNode(child, isHorizontal));
    });
    return isHorizontal
      ? new WrappedTree(root.height, root.width, root.x, children)
      : new WrappedTree(root.width, root.height, root.y, children);
  }
}

interface IH {
  low: number;
  index: number;
  nxt: IH | null;
}

function moveRight<T>(node: Node<T>, move: number, isHorizontal?: boolean) {
  if (isHorizontal) {
    node.y += move;
  } else {
    node.x += move;
  }
  node.children.forEach(child => {
    moveRight(child, move, isHorizontal);
  });
}

function getMin<T>(node: Node<T>, isHorizontal?: boolean) {
  let res = isHorizontal ? node.y : node.x;
  node.children.forEach(child => {
    res = Math.min(getMin(child, isHorizontal), res);
  });
  return res;
}

function normalize<T>(node: Node<T>, isHorizontal?: boolean) {
  const min = getMin(node, isHorizontal);
  moveRight(node, -min, isHorizontal);
}

function convertBack<T>(converted: WrappedTree, root: Node<T>, isHorizontal?: boolean) {
  if (isHorizontal) {
    root.y = converted.x;
  } else {
    root.x = converted.x;
  }
  converted.c.forEach((child, i) => {
    convertBack(child, root.children[i], isHorizontal);
  });
}

function layer<T>(node: Node<T>, isHorizontal?: boolean, d = 0) {
  if (isHorizontal) {
    node.x = d;
    d += node.width;
  } else {
    node.y = d;
    d += node.height;
  }
  node.children.forEach(child => {
    layer(child, isHorizontal, d);
  });
}

function layout<T>(root: Node<T>, options: HierarchyOptions<T>) {
  const isHorizontal = options.isHorizontal;
  function firstWalk(t: WrappedTree) {
    if (t.cs === 0) {
      setExtremes(t);
      return;
    }
    firstWalk(t.c[0]);
    // prev steps make sure that el is not null
    let ih = updateIYL(bottom(t.c[0].el!), 0, null);
    for (let i = 1; i < t.cs; ++i) {
      firstWalk(t.c[i]);
      // prev steps make sure that er is not null
      const min = bottom(t.c[i].er!);
      separate(t, i, ih);
      ih = updateIYL(min, i, ih);
    }
    positionRoot(t);
    setExtremes(t);
  }

  function setExtremes(t: WrappedTree) {
    if (t.cs === 0) {
      t.el = t;
      t.er = t;
      t.msel = t.mser = 0;
    } else {
      t.el = t.c[0].el;
      t.msel = t.c[0].msel;
      t.er = t.c[t.cs - 1].er;
      t.mser = t.c[t.cs - 1].mser;
    }
  }

  function separate(t: WrappedTree, i: number, ih: IH) {
    let sr: WrappedTree | null = t.c[i - 1];
    let mssr = sr.mod;
    let cl: WrappedTree | null = t.c[i];
    let mscl = cl.mod;
    while (sr !== null && cl !== null) {
      // Todo: ih may be null here ?
      // @ts-ignore
      if (bottom(sr) > ih.low) ih = ih.nxt;
      const dist = (mssr + sr.prelim + sr.w) - (mscl + cl.prelim);
      if (dist > 0) {
        mscl += dist;
        moveSubtree(t, i, ih.index, dist);
      }
      const sy = bottom(sr);
      const cy = bottom(cl);
      if (sy <= cy) {
        sr = nextRightContour(sr);
        if (sr !== null) mssr += sr.mod;
      }
      if (sy >= cy) {
        cl = nextLeftContour(cl);
        if (cl !== null) mscl += cl.mod;
      }
    }
    if (!sr && !!cl) {
      setLeftThread(t, i, cl, mscl);
    } else if (!!sr && !cl) {
      setRightThread(t, i, sr, mssr);
    }
  }

  function moveSubtree(t: WrappedTree, i: number, si: number, dist: number) {
    t.c[i].mod += dist;
    t.c[i].msel += dist;
    t.c[i].mser += dist;
    distributeExtra(t, i, si, dist);
  }

  function nextLeftContour(t: WrappedTree) {
    return t.cs === 0 ? t.tl : t.c[0];
  }

  function nextRightContour(t: WrappedTree) {
    return t.cs === 0 ? t.tr : t.c[t.cs - 1];
  }

  function bottom(t: WrappedTree) {
    return t.y + t.h;
  }

  function setLeftThread(t: WrappedTree, i: number, cl: WrappedTree, modsumcl: number) {
    const li = t.c[0].el;
    if (li) {
      li.tl = cl;
      const diff = (modsumcl - cl.mod) - t.c[0].msel;
      li.mod += diff;
      li.prelim -= diff;
    }
    t.c[0].el = t.c[i].el;
    t.c[0].msel = t.c[i].msel;
  }

  function setRightThread(t: WrappedTree, i: number, sr: WrappedTree, modsumsr: number) {
    const ri = t.c[i].er;
    if (ri) {
      ri.tr = sr;
      const diff = (modsumsr - sr.mod) - t.c[i].mser;
      ri.mod += diff;
      ri.prelim -= diff;
    }
    t.c[i].er = t.c[i - 1].er;
    t.c[i].mser = t.c[i - 1].mser;
  }

  function positionRoot(t: WrappedTree) {
    t.prelim = (
      t.c[0].prelim + t.c[0].mod + t.c[t.cs - 1].mod +
      t.c[t.cs - 1].prelim + t.c[t.cs - 1].w
    ) / 2 - t.w / 2;
  }

  function secondWalk(t: WrappedTree, modsum: number) {
    modsum += t.mod;
    t.x = t.prelim + modsum;
    addChildSpacing(t);
    for (let i = 0; i < t.cs; i++) {
      secondWalk(t.c[i], modsum);
    }
  }

  function distributeExtra(t: WrappedTree, i: number, si: number, dist: number) {
    if (si !== i - 1) {
      const nr = i - si;
      t.c[si + 1].shift += dist / nr;
      t.c[i].shift -= dist / nr;
      t.c[i].change -= dist - dist / nr;
    }
  }

  function addChildSpacing(t: WrappedTree) {
    let d = 0;
    let modsumdelta = 0;
    for (let i = 0; i < t.cs; i++) {
      d += t.c[i].shift;
      modsumdelta += d + t.c[i].change;
      t.c[i].mod += modsumdelta;
    }
  }

  function updateIYL(low: number, index: number, ih: IH | null): IH {
    while (ih !== null && low >= ih.low) {
      ih = ih.nxt;
    }
    return { low, index, nxt: ih };
  }

  // do layout
  layer(root, isHorizontal);
  const wt = WrappedTree.fromNode(root, isHorizontal);
  firstWalk(wt);
  secondWalk(wt, 0);
  convertBack(wt, root, isHorizontal);
  normalize(root, isHorizontal);

  return root;
};

export default layout;