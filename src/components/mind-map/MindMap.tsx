import { CSSProperties, Fragment, useMemo, useState } from 'react';
import { SizeMeasurer } from './SizeMeasurer';
import {
  Direction,
  FLEX_TREE,
  GetSizeFromNodeDate,
  IsNodeCollapsed,
  LayoutType,
  OUTLINE,
  RawNode,
  SizedRawNode,
  getPaddingForDirection,
  layoutFun,
  prepareNodeSize,
  useRenderWithD3,
} from './render';
export * from './render';
import './MindMap.css';

type MFC<D> = {
  style?: CSSProperties;
  tree: RawNode<D>;
  isNodeCollapsed: IsNodeCollapsed<D>;
  treeDirection: Direction;
  scale: number;
  moveNodeTo: (nodeId: string, targetId: string, index: number) => void;
  nodesRender: (
    pendingRenderNodes: [SVGForeignObjectElement, SizedRawNode<D>][],
  ) => JSX.Element;
};

export function MindMap<D>(props: MFC<D>) {
  const {
    style,
    tree,
    treeDirection,
    scale,
    isNodeCollapsed,
    moveNodeTo,
    nodesRender,
  } = props;
  const [sizedData, setSizedData] = useState<SizedRawNode<D> | null>(null);

  const root = useMemo(() => {
    if (!sizedData) return null;
    return layoutFun(LayoutType.FLEX_TREE)(sizedData, {
      direction: treeDirection,
      getInfo: (d) => ({
        id: d.id,
        padding: getPaddingForDirection(treeDirection),
        size: { width: d.content_size[0], height: d.content_size[1] },
        collapsed: isNodeCollapsed(d.payload),
      }),
      getChildren: (d) => d.children || [],
    });
  }, [tree, treeDirection, sizedData, isNodeCollapsed]);
  const { svg, pendingRenderNodes } = useRenderWithD3(
    root,
    treeDirection,
    scale,
    moveNodeTo,
  );

  const nodes = nodesRender(pendingRenderNodes);

  return (
    <Fragment>
      <SizeMeasurer root={tree} onSize={setSizedData} />

      <div style={style}>
        <svg
          ref={svg}
          role="presentation"
          style={{ height: '100%', width: '100%', display: 'block' }}
        ></svg>
        {nodes}
      </div>
    </Fragment>
  );
}
