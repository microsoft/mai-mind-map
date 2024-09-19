import { Fragment, useCallback, useContext, useState } from 'react';

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

import { MindMapState } from '../state/mindMapState';

import './MapIndex.css';

function isNodeCollapsed(data: Payload): boolean {
  return data.collapsed || false;
}

let direction: Direction = 'H';
let scaleValue = 1;

export function MindMapView() {
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
  const treeState = useContext(MindMapState);

  return treeState ? (
    <Fragment>
      <Controller dir={dir} serDir={setDir} scale={scale} setScale={setScale} />
      <MindMap
        style={{
          height: '100%',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
        tree={treeState.mindMapData}
        isNodeCollapsed={isNodeCollapsed}
        treeDirection={dir}
        scale={scale}
        modifyNode={treeState.modifyNode}
        moveNodeTo={treeState.moveNodeTo}
        toggleCollapseNode={treeState.toggleCollapseNode}
        addNode={treeState.addNode}
        delNode={treeState.delNode}
      />
    </Fragment>
  ) : null;
}
