import { MutableRefObject } from 'react';
import { type TreeState } from '../hooks/useRenderWithD3';
import { Direction } from '../layout/flex-tree/hierarchy';
import { NodeInterface } from '../layout/interface';

export * from './getSizeFromNodeDate';
export * from './getLinkForDirection';

export function isHorizontalDirection(treeState: MutableRefObject<TreeState>) {
  return ['LR', 'RL', 'H'].includes(treeState.current.direction);
}

export function getPaddingForDirection(direction: Direction) {
  switch (direction) {
    case 'LR':
    case 'RL':
    case 'H':
      return { v: 5, h: 30 };
    case 'BT':
    case 'TB':
    case 'V':
      return { v: 30, h: 5 };
    default: // This is a safety net for future changes
      return { v: 5, h: 30 };
  }
}

export function getNodePosXForDirection(
  x: number,
  nodeWidth: number,
  treeState: MutableRefObject<TreeState>,
) {
  switch (treeState.current.direction) {
    // Horizontal layout, no need to adjust x
    case 'LR':
    case 'H':
    case 'RL':
      return x;
    // Vertical layout, adjust x by half of node width
    case 'TB':
    case 'V':
    case 'BT':
      return x - nodeWidth / 2;
  }
}

export function getNodePosYForDirection(
  y: number,
  nodeHeight: number,
  treeState: MutableRefObject<TreeState>,
) {
  switch (treeState.current.direction) {
    // Vertical layout, no need to adjust y
    case 'TB':
    case 'V':
    case 'BT':
      return y;
    // Horizontal layout, adjust y by half of node height
    case 'LR':
    case 'H':
    case 'RL':
      return y - nodeHeight / 2;
  }
}

export function getDragBtnPosXForDirection<D>(
  x: number,
  node: NodeInterface<D>,
  btnWidth: number,
  btnHeight: number,
  treeState: MutableRefObject<TreeState>,
) {
  const {
    inSize: { width: nodeWidth },
  } = node;
  if (node.isRoot()) {
    return x;
  }
  switch (treeState.current.direction) {
    // Horizontal layout, no need to adjust x
    case 'LR':
      return x;
    case 'RL':
      return x + nodeWidth - btnHeight;
    case 'H':
      if (node.x > (node.parent?.x || 0)) {
        return x;
      } else {
        return x + nodeWidth - btnHeight;
      }
    // Vertical layout, adjust x by half of node width
    case 'TB':
    case 'V':
    case 'BT':
      return x - btnWidth / 2;
  }
}

export function getDragBtnPosYForDirection<D>(
  y: number,
  node: NodeInterface<D>,
  btnWidth: number,
  btnHeight: number,
  treeState: MutableRefObject<TreeState>,
) {
  const {
    inSize: { height: nodeHeight },
  } = node;
  if (node.isRoot()) {
    return y;
  }
  switch (treeState.current.direction) {
    // Horizontal layout, no need to adjust x
    case 'LR':
    case 'RL':
    case 'H':
      return y - btnWidth / 2;
    // Vertical layout, adjust x by half of node width
    case 'TB':
      return y;
    case 'BT':
      return y + nodeHeight - btnHeight;
    case 'V':
      if (node.y > (node.parent?.y || 0)) {
        return y;
      } else {
        return y + nodeHeight - btnHeight;
      }
  }
}

export function getLinkPointPairForDirection(
  treeState: MutableRefObject<TreeState>,
  source: [number, number, number, number], // [x,y,w,h]
  target: [number, number, number, number], // [x,y,w,h]
): {
  source: [number, number];
  target: [number, number];
} {
  const [sourceX, sourceY, sourceW, sourceH] = source;
  const [targetX, targetY, targetW, targetH] = target;
  switch (treeState.current.direction) {
    // Vertical layout
    case 'TB':
      return {
        source: [sourceX, sourceY + sourceH],
        target: [targetX, targetY],
      };
    case 'BT':
      return {
        source: [sourceX, sourceY],
        target: [targetX, targetY + targetH],
      };
    case 'V':
      if (sourceY < targetY) {
        // TB
        return {
          source: [sourceX, sourceY + sourceH],
          target: [targetX, targetY],
        };
      } else {
        // BT
        return {
          source: [sourceX, sourceY],
          target: [targetX, targetY + targetH],
        };
      }
    // Horizontal layout
    case 'LR':
      return {
        source: [sourceX + sourceW, sourceY],
        target: [targetX, targetY],
      };
    case 'RL':
      return {
        source: [sourceX, sourceY],
        target: [targetX + targetW, targetY],
      };
    case 'H':
      if (sourceX < targetX) {
        // LR
        return {
          source: [sourceX + sourceW, sourceY],
          target: [targetX, targetY],
        };
      } else {
        // RL
        return {
          source: [sourceX, sourceY],
          target: [targetX + targetW, targetY],
        };
      }
  }
}

export function getDraggingX<D>(node: NodeInterface<D>): number {
  return !node.draggingX && node.draggingX !== 0 ? node.x : node.draggingX;
}

export function getDraggingY<D>(node: NodeInterface<D>): number {
  return !node.draggingY && node.draggingY !== 0 ? node.y : node.draggingY;
}
