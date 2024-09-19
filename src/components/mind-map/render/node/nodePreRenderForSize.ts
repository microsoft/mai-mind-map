import { listDocuments } from '@root/model/api';
import { GetSizeFromNodeDate, RawNode, SizedRawNode } from './interface';

export default function prepareNodeSize<Mdata>(
  node: RawNode<Mdata>,
  getSize: GetSizeFromNodeDate,
  elIdPrefix: string,
): SizedRawNode<Mdata> {
  const content_size = getSize(`${elIdPrefix}-${node.id}`);

  const children = node.children?.map((child) => {
    const childNode = prepareNodeSize(child, getSize, elIdPrefix);
    return childNode;
  });
  return {
    ...node,
    children,
    content_size,
  };
}

listDocuments().then(console.log);