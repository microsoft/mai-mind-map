import flexTreeLayout, { HierarchyOptions } from './flex-tree';
import { NodeInterface } from './interface';
import outlineLayout from './outline';

export { type Direction, type HierarchyOptions } from './flex-tree';
export * from './interface';
export type FLEX_TREE = 1;
export type OUTLINE = 2;

export enum LayoutType {
  FLEX_TREE = 1,
  OUTLINE = 2,
}

function layoutFun(
  layoutType: FLEX_TREE,
): <T>(root: T, options: HierarchyOptions<T>) => NodeInterface<T>;
function layoutFun(layoutType: OUTLINE): <T>(root: T) => NodeInterface<T>;
function layoutFun(layoutType: FLEX_TREE | OUTLINE) {
  switch (layoutType) {
    case LayoutType.FLEX_TREE:
      return flexTreeLayout;
    case LayoutType.OUTLINE:
      return outlineLayout;
    default:
      return flexTreeLayout;
  }
}

export default layoutFun;
