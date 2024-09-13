import { Fragment, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { LayoutControl } from './LayoutControl';
import { NodeContent } from './NodeContent';
import { ScaleControl } from './ScaleControl';
import { Direction } from './render';

import {
  LayoutType,
  MindMap,
  exampleSourceData,
  getSizeFromNodeDate,
  moveNodeTo,
} from './MindMap';
import './MapIndex.css';

export function MindMapView() {
  const [treeData, setTreeData] = useState(exampleSourceData);
  const [dir, serDir] = useState<Direction>('TB');
  const [scale, setScale] = useState(1);
  const moveNodeToFun = useCallback(
    (nodeId: string, targetId: string, index: number) => {
      setTreeData(moveNodeTo(nodeId, targetId, index));
    },
    [setTreeData],
  );
  return (
    <Fragment>
      <div className="config-controller">
        <LayoutControl direction={dir} setDirection={serDir} />

        <ScaleControl min={0.2} max={5} scale={scale} setScale={setScale} />
      </div>
      <MindMap
        style={{ height: '100%', width: '100%' }}
        tree={treeData}
        isNodeCollapsed={(data) => data.collapsed || false}
        treeDirection={dir}
        scale={scale}
        moveNodeTo={moveNodeToFun}
        nodesRender={(pendingRenderNodes) => {
          return (
            <Fragment>
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
            </Fragment>
          );
        }}
      />
    </Fragment>
  );
}
