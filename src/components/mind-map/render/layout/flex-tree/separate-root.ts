import hierarchy, { Node, HierarchyOptions } from './hierarchy';

function separate<T>(root: Node<T>, options: HierarchyOptions<T>) {
  // separate into left and right trees
  const left = hierarchy(root.data, options, true); // root only
  const right = hierarchy(root.data, options, true); // root only
  // automatically
  const treeSize = root.children.length;
  const rightTreeSize = Math.round(treeSize / 2);
  // separate left and right tree by meta data
  const getSide =
    options.getSide ||
    ((child, index) => {
      if (index < rightTreeSize) return 'right';
      return 'left';
    });

  for (let i = 0; i < treeSize; i++) {
    const child = root.children[i];
    const side = getSide(child, i);
    if (side === 'right') {
      right.children.push(child);
    } else {
      left.children.push(child);
    }
  }

  left.DFTraverse((node) => {
    if (!node.isRoot()) node.side = 'left';
  });

  right.DFTraverse((node) => {
    if (!node.isRoot()) node.side = 'right';
  });

  return { left, right };
}

export default separate;
