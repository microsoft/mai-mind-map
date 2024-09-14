import { linkHorizontal, linkVertical } from 'd3-shape';
import { MutableRefObject } from 'react';
import { type TreeState } from '../hooks/constants';

export function getLinkForDirection<D>(
  treeState: MutableRefObject<TreeState<D>>,
) {
  switch (treeState.current.direction) {
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
