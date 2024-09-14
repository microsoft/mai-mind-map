import { CSSProperties, Fragment, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { EditingNode, EditingNodeType } from './EditingNode';
import { NodeContent } from './NodeContent';
import { SizeMeasurer } from './SizeMeasurer';
import {
  Direction,
  FLEX_TREE,
  GetSizeFromNodeDate,
  IsNodeCollapsed,
  LayoutType,
  NodeInterface,
  OUTLINE,
  RawNode,
  SizedRawNode,
  getPaddingForDirection,
  layoutFun,
  prepareNodeSize,
  useRenderWithD3,
} from './render';
import { Payload } from './render/model/interface';
export * from './render';
import './MindMap.css';

type MFC<D> = {
  style?: CSSProperties;
  tree: RawNode<D>;
  isNodeCollapsed: IsNodeCollapsed<D>;
  treeDirection: Direction;
  scale: number;
  moveNodeTo: (nodeId: string, targetId: string, index: number) => void;
  modifyNode: (nodeId: string, content: string) => void;
};

export function MindMap(props: MFC<Payload>) {
  const {
    style,
    tree,
    treeDirection,
    scale,
    isNodeCollapsed,
    moveNodeTo,
    modifyNode,
  } = props;
  const [sizedData, setSizedData] = useState<SizedRawNode<Payload> | null>(
    null,
  );
  const [editingNode, setEditingNode] =
    useState<EditingNodeType<Payload> | null>(null);

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
  }, [treeDirection, sizedData, isNodeCollapsed]);
  const { svg, pendingRenderNodes } = useRenderWithD3(
    root,
    treeDirection,
    scale,
    moveNodeTo,
    setEditingNode,
  );

  return (
    <Fragment>
      <SizeMeasurer root={tree} onSize={setSizedData} />
      <div style={style}>
        <svg
          ref={svg}
          role="presentation"
          style={{ height: '100%', width: '100%', display: 'block' }}
        ></svg>
        {pendingRenderNodes.map(([node, data]) => {
          return (
            <Fragment key={data.id}>
              {createPortal(
                <NodeContent id={data.id} data={data.payload} />,
                node,
              )}
            </Fragment>
          );
        })}
        <EditingNode
          node={editingNode}
          modifyNode={modifyNode}
          setEditingNode={setEditingNode}
        />
      </div>
    </Fragment>
  );
}
