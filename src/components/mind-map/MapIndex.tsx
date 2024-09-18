import { Fragment, useCallback, useState } from 'react';

import { Controller } from './Controller';

import { Direction } from './render';

import {
  MindMap,
  addNode,
  delNode,
  getExampleSourceData,
  modifyNodeContent,
  moveNodeTo,
  toggleCollapseNode,
} from './MindMap';

import './MapIndex.css';

export function MindMapView() {
  const [treeData, setTreeData] = useState(getExampleSourceData());
  const [dir, serDir] = useState<Direction>('H');
  const [scale, setScale] = useState(1);
  const moveNodeToFun = useCallback(
    (nodeId: string, targetId: string, index: number) => {
      setTreeData(moveNodeTo(nodeId, targetId, index));
    },
    [setTreeData],
  );
  const modifyNode = useCallback(
    (nodeId: string, content: string) => {
      setTreeData(modifyNodeContent(nodeId, content));
    },
    [setTreeData],
  );
  const toggleCollapseNodeFun = useCallback(
    (nodeId: string) => {
      setTreeData(toggleCollapseNode(nodeId));
    },
    [setTreeData],
  );
  const addNodeFun = useCallback(
    (parentId: string, content: string) => {
      setTreeData(addNode(parentId, content));
    },
    [setTreeData],
  );
  const delNodeFun = useCallback(
    (id: string) => {
      setTreeData(delNode(id));
    },
    [setTreeData],
  );
  return (
    <Fragment>
      <Controller dir={dir} serDir={serDir} scale={scale} setScale={setScale} />
      <MindMap
        style={{
          height: '100%',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
        tree={treeData}
        isNodeCollapsed={(data) => data.collapsed || false}
        treeDirection={dir}
        scale={scale}
        modifyNode={modifyNode}
        moveNodeTo={moveNodeToFun}
        toggleCollapseNode={toggleCollapseNodeFun}
        addNode={addNodeFun}
        delNode={delNodeFun}
      />
    </Fragment>
  );
}
