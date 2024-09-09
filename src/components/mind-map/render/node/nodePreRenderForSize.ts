import { GetSizeFromNodeDate, RawNode, SizedRawNode } from './interface';

export default function prepareNodeSize<Mdata>(
  node: RawNode<Mdata>,
  getSizeFromNodeDate: GetSizeFromNodeDate<Mdata>,
): SizedRawNode<Mdata> {
  const content_size = getSizeFromNodeDate(node.payload);

  const children = node.children?.map((child) => {
    const childNode = prepareNodeSize(child, getSizeFromNodeDate);
    return childNode;
  });
  return {
    ...node,
    children,
    content_size,
  };
}
