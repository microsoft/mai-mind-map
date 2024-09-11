import { Fragment, useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { css } from '@base/styled';
import { Direction } from './mind-map/render';

import {
  LayoutType,
  MindMap,
  exampleSourceData,
  getSizeFromNodeDate,
  moveNodeTo,
} from './mind-map/index';

const SDirections = css`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  line-height: 20px;
  gap: 4px;

  & > .dir-item {
    background-color: aliceblue;
    padding: 1px 10px;
    cursor: pointer;
    border: 1px solid #1893ff;
    &:hover {
      background-color: #badfff;
    }
    &.active {
      background-color: #1893ff;
      color: white;
    }
  }
`;

export function LayoutDemo() {
  const [treeData, setTreeData] = useState(exampleSourceData);
  const [dir, serDir] = useState<Direction>('TB');
  const moveNodeToFun = useCallback(
    (nodeId: string, targetId: string, index: number) => {
      setTreeData(moveNodeTo(nodeId, targetId, index));
    },
    [setTreeData],
  );
  return (
    <Fragment>
      <div className={SDirections}>
        {(['LR', 'RL', 'TB', 'BT', 'H', 'V'] as const).map((d) => {
          return (
            <div
              key={d}
              className={`dir-item ${d === dir ? ' active' : ''}`}
              onClick={() => {
                serDir(d);
              }}
            >
              {d}
            </div>
          );
        })}
      </div>
      <MindMap
        style={{ height: '100%', width: '100%' }}
        tree={treeData}
        layoutType={LayoutType.FLEX_TREE}
        getSizeFromNodeDate={getSizeFromNodeDate}
        isNodeCollapsed={(data) => data.collapsed || false}
        treeDirection={dir}
        moveNodeTo={moveNodeToFun}
        nodesRender={(pendingRenderNodes) => {
          return (
            <Fragment>
              {pendingRenderNodes.map(([node, data]) => {
                return (
                  <Fragment key={data.id}>
                    {createPortal(<pre>{data.payload.content}</pre>, node)}
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
