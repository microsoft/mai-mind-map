import { CSSProperties, useMemo } from 'react';
import {
  Direction,
  FLEX_TREE,
  GetSizeFromNodeDate,
  IsNodeCollapsed,
  LayoutType,
  OUTLINE,
  RawNode,
  getPaddingForDirection,
  layoutFun,
  prepareNodeSize,
  useRenderWithD3,
} from './render';
export * from './render';

type MFC<D> = {
  style?: CSSProperties;
  tree: RawNode<D>;
  getSizeFromNodeDate: GetSizeFromNodeDate<D>;
  isNodeCollapsed: IsNodeCollapsed<D>;
  layoutType: LayoutType;
  treeDirection: Direction;
};

export function MindMap<D>(props: MFC<D>) {
  const {
    style,
    tree,
    layoutType,
    treeDirection,
    getSizeFromNodeDate,
    isNodeCollapsed,
  } = props;
  const root = useMemo(() => {
    const sizedData = prepareNodeSize(tree, getSizeFromNodeDate);
    switch (layoutType) {
      case LayoutType.FLEX_TREE:
        return layoutFun(layoutType as FLEX_TREE)(sizedData, {
          direction: treeDirection,
          getInfo: (d) => ({
            id: d.id,
            padding: getPaddingForDirection(treeDirection),
            size: { width: d.content_size[0], height: d.content_size[1] },
            collapsed: isNodeCollapsed(d.payload),
          }),
          getChildren: (d) => d.children || [],
        });
      case LayoutType.OUTLINE:
        return layoutFun(layoutType as OUTLINE)(sizedData);
      default:
        return layoutFun(layoutType as OUTLINE)(sizedData);
    }
  }, [tree, layoutType, treeDirection, getSizeFromNodeDate, isNodeCollapsed]);
  const ref = useRenderWithD3(root);

  return root ? (
    <div style={style}>
      <svg
        ref={ref}
        role="presentation"
        style={{ height: '100%', width: '100%' }}
      ></svg>
    </div>
  ) : (
    <div>loading...</div>
  );
}
