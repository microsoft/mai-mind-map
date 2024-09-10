import { linkHorizontal, linkVertical } from 'd3-shape';
import { Direction } from '../layout';

export function getLinkForDirection(direction: Direction) {
  switch (direction) {
    case 'LR':
    case 'RL':
    case 'H':
      return linkHorizontal();
    case 'TB':
    case 'BT':
    case 'V':
      return linkVertical();
    default:
      return linkVertical();
  }
}
