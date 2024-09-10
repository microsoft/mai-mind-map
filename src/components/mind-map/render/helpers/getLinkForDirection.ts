import { MutableRefObject } from 'react';
import { linkHorizontal, linkVertical } from 'd3-shape';
import { Direction } from '../layout';

export function getLinkForDirection(direction: MutableRefObject<Direction>) {
  switch (direction.current) {
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
