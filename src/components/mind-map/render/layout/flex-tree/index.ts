import { NodeInterface } from '../interface';
import doTreeLayout from './do-layout';
import hierarchy, {
  HierarchyOptions,
  Node,
  Direction,
  completeCollapseItems,
} from './hierarchy';
import nonLayeredTidyTree from './non-layered-tidy';

function layout<T>(root: T, options: HierarchyOptions<T>): NodeInterface<T> {
  const re = doTreeLayout(
    hierarchy(root, options, undefined),
    options,
    nonLayeredTidyTree,
  );
  // re.centering();
  completeCollapseItems(re, root, options);
  return re;
}

export type { HierarchyOptions, Direction };
export { Node };
export default layout;
