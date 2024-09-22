import { MutableRefObject } from 'react';
import { type TreeState } from '../hooks/constants';
import { LinkMode } from '../hooks/constants';
import { Direction } from '../layout/flex-tree/hierarchy';
import { NodeInterface, NodeLink } from '../layout/interface';
import { SizedRawNode } from '../node/interface';

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

const redundancyCoefficient = 1.1;

export function getLinkPointPair<D>(
  treeState: MutableRefObject<TreeState<D>>,
  link: NodeLink<SizedRawNode<D>>,
): {
  source: [number, number];
  target: [number, number];
} {
  const { source, target } = link;

  if (treeState.current.linkMode === LinkMode.HYBRID) {
    if (source.isRoot()) {
      const halfWidth = source.data.content_size[0] / 2;
      const halfHeight = source.data.content_size[1] / 2;
      const originX = source.x + halfWidth;
      const originY = source.y + halfHeight;

      const [targetWidth, targetHeight] = target.data.content_size;

      switch (treeState.current.direction) {
        case 'LR':
        case 'RL':
        case 'H': {
          let { maxTopLeftD, maxTopRightD, maxBottomLeftD, maxBottomRightD } =
            computeExtremumDistances(source, 1);

          maxTopLeftD *= redundancyCoefficient;
          maxTopRightD *= redundancyCoefficient;
          maxBottomLeftD *= redundancyCoefficient;
          maxBottomRightD *= redundancyCoefficient;
          if (target.x > source.x) {
            // on the right side
            if (target.y < source.y) {
              // top right
              const shiftX =
                halfWidth * (1 - Math.abs(target.y - source.y) / maxTopRightD);
              return {
                source: [originX + shiftX, originY],
                target: [target.x, target.y + targetHeight / 2],
              };
            } else {
              // bottom right
              const shiftX =
                halfWidth *
                (1 - Math.abs(target.y - source.y) / maxBottomRightD);
              return {
                source: [originX + shiftX, originY],
                target: [target.x, target.y + targetHeight / 2],
              };
            }
          } else {
            // on the left side
            if (target.y < source.y) {
              // top left
              const shiftX =
                halfWidth * (1 - Math.abs(target.y - source.y) / maxTopLeftD);
              return {
                source: [originX - shiftX, originY],
                target: [target.x + targetWidth, target.y + targetHeight / 2],
              };
            } else {
              // bottom left
              const shiftX =
                halfWidth *
                (1 - Math.abs(target.y - source.y) / maxBottomLeftD);
              return {
                source: [originX - shiftX, originY],
                target: [target.x + targetWidth, target.y + targetHeight / 2],
              };
            }
          }
        }

        case 'TB':
        case 'BT':
        case 'V': {
          let { maxTopLeftD, maxTopRightD, maxBottomLeftD, maxBottomRightD } =
            computeExtremumDistances(source, 2);
          maxTopLeftD *= redundancyCoefficient;
          maxTopRightD *= redundancyCoefficient;
          maxBottomLeftD *= redundancyCoefficient;
          maxBottomRightD *= redundancyCoefficient;
          if (target.y < source.y) {
            // on the top side
            if (target.x < source.x) {
              // top left
              const shiftY =
                halfHeight * (1 - Math.abs(target.x - source.x) / maxTopLeftD);
              return {
                source: [originX, originY - shiftY],
                target: [target.x + targetWidth / 2, target.y + targetHeight],
              };
            } else {
              // top right
              const shiftY =
                halfHeight * (1 - Math.abs(target.x - source.x) / maxTopRightD);
              return {
                source: [originX, originY - shiftY],
                target: [target.x + targetWidth / 2, target.y + targetHeight],
              };
            }
          } else {
            // on the bottom side
            if (target.x < source.x) {
              // bottom left
              const shiftY =
                halfHeight *
                (1 - Math.abs(target.x - source.x) / maxBottomLeftD);
              return {
                source: [originX, originY + shiftY],
                target: [target.x + targetWidth / 2, target.y],
              };
            } else {
              // bottom right
              const shiftY =
                halfHeight *
                (1 - Math.abs(target.x - source.x) / maxBottomRightD);
              return {
                source: [originX, originY + shiftY],
                target: [target.x + targetWidth / 2, target.y],
              };
            }
          }
        }
      }
    }
  }

  return getLinkPointPairDefault(treeState, link);
}

// direction 1: horizontal, 2: vertical
let cachedNode: NodeInterface<SizedRawNode<any>> | null = null;
let cachedDirection: 1 | 2 = 1;
let cachedResult: {
  maxTopLeftD: number;
  maxTopRightD: number;
  maxBottomLeftD: number;
  maxBottomRightD: number;
} | null = null;
function computeExtremumDistances<D>(
  node: NodeInterface<SizedRawNode<D>>,
  direction: 1 | 2,
) {
  if (cachedNode === node && cachedDirection === direction && cachedResult) {
    return cachedResult;
  }
  cachedNode = node;
  cachedDirection = direction;

  let maxTopLeftD = 0;
  let maxTopRightD = 0;
  let maxBottomLeftD = 0;
  let maxBottomRightD = 0;
  if (direction === 1) {
    // horizontal
    for (const child of node.children) {
      if (child.x > node.x) {
        // on the right side
        if (child.y < node.y) {
          // top right
          maxTopRightD = Math.max(maxTopRightD, Math.abs(child.y - node.y));
        } else {
          // bottom right
          maxBottomRightD = Math.max(
            maxBottomRightD,
            Math.abs(child.y - node.y),
          );
        }
      } else {
        // on the left side
        if (child.y < node.y) {
          // top left
          maxTopLeftD = Math.max(maxTopLeftD, Math.abs(child.y - node.y));
        } else {
          // bottom left
          maxBottomLeftD = Math.max(maxBottomLeftD, Math.abs(child.y - node.y));
        }
      }
    }
  } else {
    // vertical
    for (const child of node.children) {
      if (child.y > node.y) {
        // on the bottom side
        if (child.x < node.x) {
          // left bottom
          maxBottomLeftD = Math.max(maxBottomLeftD, Math.abs(child.x - node.x));
        } else {
          maxBottomRightD = Math.max(
            maxBottomRightD,
            Math.abs(child.x - node.x),
          );
        }
      } else {
        // on the top side
        if (child.x < node.x) {
          maxTopLeftD = Math.max(maxTopLeftD, Math.abs(child.x - node.x));
        } else {
          maxTopRightD = Math.max(maxTopRightD, Math.abs(child.x - node.x));
        }
      }
    }
  }

  const re = {
    maxTopLeftD,
    maxTopRightD,
    maxBottomLeftD,
    maxBottomRightD,
  };
  cachedResult = re;
  return re;
}

function getLinkPointPairDefault<D>(
  treeState: MutableRefObject<TreeState<D>>,
  link: NodeLink<SizedRawNode<D>>,
) {
  const { source, target } = link;
  const sourceRect: [number, number, number, number, number, number] = [
    source.x,
    source.y,
    source.data.content_size[0],
    source.data.content_size[1],
    source.x,
    source.y,
  ];

  const targetRect: [number, number, number, number, number, number] = [
    target.x,
    target.y,
    target.data.content_size[0],
    target.data.content_size[1],
    target.x,
    target.y,
  ];
  return getLinkPointPairForDirection(treeState, sourceRect, targetRect);
}

function getLinkPointPairForDirection<D>(
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
