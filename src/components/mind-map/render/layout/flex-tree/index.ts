import { NodeInterface } from '../interface';
import doTreeLayout from './do-layout';
import hierarchy, { HierarchyOptions, Node, Direction } from './hierarchy';
import nonLayeredTidyTree from './non-layered-tidy';

function layout<T>(root: T, options: HierarchyOptions<T>): NodeInterface<T> {
  return doTreeLayout(
    hierarchy(root, options, undefined),
    options,
    nonLayeredTidyTree,
  );
}

export type { HierarchyOptions, Direction };
export { Node };
export default layout;
