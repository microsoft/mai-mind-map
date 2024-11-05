import { CSSProperties, Fragment, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ScaleControl } from './Controllers/ScaleControl';
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
import { ColorMode, LinkMode } from './render/hooks/constants';
import { Payload } from './render/model/interface';
export * from './render';
import './MindMap.css';

type MFC<D> = {
  style?: CSSProperties;
  tree: RawNode<D>;
  isNodeCollapsed: IsNodeCollapsed<D>;
  treeDirection: Direction;
  scale: number;
  setScale: (val: React.SetStateAction<number>) => void;
  linkMode: LinkMode;
  colorMode: ColorMode;
  moveNodeTo: (nodeId: string, targetId: string, index: number) => void;
  modifyNode: (nodeId: string, content: string) => void;
  modifyNodePayload: (nodeId: string, payload: Payload) => void;
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
    setScale,
    linkMode,
    colorMode,
    isNodeCollapsed,
    moveNodeTo,
    modifyNode,
    modifyNodePayload,
    toggleCollapseNode,
    addNode,
    delNode,
  } = props;
  const [sizedData, setSizedData] = useState<SizedRawNode<Payload> | null>(
    null,
  );
  const [editingNode, setPendingEditNode] =
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
    {
      direction: treeDirection,
      scale,
      linkMode,
      colorMode,
    },
    moveNodeTo,
    setPendingEditNode,
  );

  return (
    <Fragment>
      <SizeMeasurer root={tree} onSize={setSizedData} />
      <div
        style={style}
        onWheelCapture={(e) => {
          setScale((s) => {
            const ns = s - e.deltaY / 1000;
            const ns01 = Math.floor(ns * 10 + 0.5) / 10;
            return Math.max(0.2, Math.min(5, ns01));
          });
        }}
      >
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
                  colorMode={colorMode}
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
          root={root}
          colorMode={colorMode}
          modifyNode={modifyNode}
          modifyNodePayload={modifyNodePayload}
          setPendingEditNode={setPendingEditNode}
          toggleCollapseNode={toggleCollapseNode}
          addNode={addNode}
          delNode={delNode}
        />
        <ScaleControl
          min={0.2}
          max={5}
          scale={scale}
          setScale={setScale}
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
          }}
        />
      </div>
    </Fragment>
  );
}
