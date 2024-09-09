import { Direction } from '../layout/flex-tree/hierarchy';

export * from './getSizeFromNodeDate';

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
