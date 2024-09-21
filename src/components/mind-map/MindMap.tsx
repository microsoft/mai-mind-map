import { CSSProperties, Fragment, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { EditingNode, EditingNodeType } from './EditingNode';
import { SizeMeasurer } from './SizeMeasurer';
import { TreeNode } from './TreeNode';
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
  toggleCollapseNode(nodeId: string): void;
  addNode(parentId: string, index: number, content: string): void;
  delNode(id: string): void;
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
    toggleCollapseNode,
    addNode,
    delNode,
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
        {pendingRenderNodes.map(([nodePortal, node]) => {
          return (
            <Fragment key={node.data.id}>
              {createPortal(
                <TreeNode
                  treeDirection={treeDirection}
                  node={node}
                  toggleCollapseNode={toggleCollapseNode}
                />,
                nodePortal,
              )}
            </Fragment>
          );
        })}
        <EditingNode
          scale={scale}
          node={editingNode}
          modifyNode={modifyNode}
          setPendingEditNode={setEditingNode}
          toggleCollapseNode={toggleCollapseNode}
          addNode={addNode}
          delNode={delNode}
        />
      </div>
    </Fragment>
  );
}
