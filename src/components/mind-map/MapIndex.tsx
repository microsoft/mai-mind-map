import { Fragment, useCallback, useContext, useState } from 'react';

import { Controller } from './Controllers/Controller';

import { Direction, Payload } from './render';

import { MindMapState } from '../state/mindMapState';
import {
  MindMap,
  addNode,
  delNode,
  getExampleSourceData,
  modifyNodeContent,
  moveNodeTo,
  toggleCollapseNode,
} from './MindMap';
import { LinkMode } from './render/hooks/constants';
import { useRenderOption } from './render/hooks/useRenderOption';

import './MapIndex.css';

function isNodeCollapsed(data: Payload): boolean {
  return data.collapsed || false;
}

export function MindMapView() {
  const {
    dir,
    setDir,
    scale,
    setScale,
    linkMode,
    setLinkMode,
    colorMode,
    setColorMode,
  } = useRenderOption();
  const treeState = useContext(MindMapState);

  return treeState ? (
    <Fragment>
      <Controller
        dir={dir}
        serDir={setDir}
        scale={scale}
        setScale={setScale}
        linkMode={linkMode}
        setLinkMode={setLinkMode}
        colorMode={colorMode}
        setColorMode={setColorMode}
      />
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
        setScale={setScale}
        linkMode={linkMode}
        colorMode={colorMode}
        modifyNode={treeState.modifyNode}
        modifyNodePayload={treeState.modifyNodePayload}
        moveNodeTo={treeState.moveNodeTo}
        toggleCollapseNode={treeState.toggleCollapseNode}
        addNode={treeState.addNode}
        delNode={treeState.delNode}
      />
    </Fragment>
  ) : null;
}
