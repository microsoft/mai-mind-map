import { MutableRefObject } from 'react';
import { type TreeState } from '../hooks/constants';
import { Direction } from '../layout/flex-tree/hierarchy';
import { NodeInterface } from '../layout/interface';

export * from './getSizeFromNodeDate';
export * from './getLinkForDirection';

export function isHorizontalDirection<D>(
  treeState: MutableRefObject<TreeState<D>>,
) {
  return ['LR', 'RL', 'H'].includes(treeState.current.direction);
}

export function getPaddingForDirection(direction: Direction) {
  switch (direction) {
    case 'LR':
    case 'RL':
    case 'H':
      return { v: 10, h: 20 };
    case 'BT':
    case 'TB':
    case 'V':
      return { v: 20, h: 10 };
    default: // This is a safety net for future changes
      return { v: 0, h: 20 };
  }
}

export function getLinkPointPairForDirection<D>(
  treeState: MutableRefObject<TreeState<D>>,
  source: [number, number, number, number, number, number], // [x,y,w,h, originX, originY]
  target: [number, number, number, number, number, number], // [x,y,w,h, originX, originY]
): {
  source: [number, number];
  target: [number, number];
} {
  const [sourceX, sourceY, sourceW, sourceH, sourceOriginX, sourceOriginY] =
    source;
  const [targetX, targetY, targetW, targetH, targetOriginX, targetOriginY] =
    target;
  // const { v, h } = getPaddingForDirection(treeState.current.direction);
  switch (treeState.current.direction) {
    // Vertical layout
    case 'TB':
      return {
        source: [sourceX + sourceW / 2, sourceY + sourceH],
        target: [targetX + targetW / 2, targetY],
      };
    case 'BT':
      return {
        source: [sourceX + sourceW / 2, sourceY],
        target: [targetX + targetW / 2, targetY + targetH],
      };
    case 'V':
      if (sourceOriginY < targetOriginY) {
        // TB
        return {
          source: [sourceX + sourceW / 2, sourceY + sourceH],
          target: [targetX + targetW / 2, targetY],
        };
      } else {
        // BT
        return {
          source: [sourceX + sourceW / 2, sourceY],
          target: [targetX + targetW / 2, targetY + targetH],
        };
      }
    // Horizontal layout
    case 'LR':
      return {
        source: [sourceX + sourceW, sourceY + sourceH / 2],
        target: [targetX, targetY + targetH / 2],
      };
    case 'RL':
      return {
        source: [sourceX, sourceY + sourceH / 2],
        target: [targetX + targetW, targetY + targetH / 2],
      };
    case 'H':
      if (sourceOriginX < targetOriginX) {
        // LR
        return {
          source: [sourceX + sourceW, sourceY + sourceH / 2],
          target: [targetX, targetY + targetH / 2],
        };
      } else {
        // RL
        return {
          source: [sourceX, sourceY + sourceH / 2],
          target: [targetX + targetW, targetY + targetH / 2],
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
