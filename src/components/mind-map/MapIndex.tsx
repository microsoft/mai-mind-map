import { Fragment, useCallback, useState } from 'react';

import { Controller } from './Controller';

import { Direction, Payload } from './render';

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

function isNodeCollapsed(data: Payload): boolean {
  return data.collapsed || false;
}

let direction: Direction = 'H';
let scaleValue = 1;

export function MindMapView() {
  const [treeData, setTreeData] = useState(getExampleSourceData());
  const [dir, setDirFun] = useState<Direction>(direction);
  const [scale, setScaleFun] = useState(scaleValue);
  const setDir = useCallback((dir: Direction) => {
    setDirFun(dir);
    direction = dir;
  }, []);
  const setScale = useCallback((scale: number) => {
    setScaleFun(scale);
    scaleValue = scale;
  }, []);
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
      <Controller dir={dir} serDir={setDir} scale={scale} setScale={setScale} />
      <MindMap
        style={{
          height: '100%',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
        tree={treeData}
        isNodeCollapsed={isNodeCollapsed}
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
