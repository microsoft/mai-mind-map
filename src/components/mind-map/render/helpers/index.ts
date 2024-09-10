import { Direction } from '../layout/flex-tree/hierarchy';

export * from './getSizeFromNodeDate';
export * from './getLinkForDirection';

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
  direction: Direction,
) {
  switch (direction) {
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
  direction: Direction,
) {
  switch (direction) {
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

export function getLinkPointPairForDirection(
  direction: Direction,
  source: [number, number, number, number], // [x,y,w,h]
  target: [number, number, number, number], // [x,y,w,h]
): {
  source: [number, number];
  target: [number, number];
} {
  const [sourceX, sourceY, sourceW, sourceH] = source;
  const [targetX, targetY, targetW, targetH] = target;
  switch (direction) {
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
