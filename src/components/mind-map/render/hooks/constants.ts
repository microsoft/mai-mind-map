import { Direction } from '../layout/flex-tree/hierarchy';
export interface TreeState {
  dragging: boolean;
  direction: Direction;
  scale: number;
  moveNodeTo: (nodeId: string, targetId: string, index: number) => void;
}

export const dragBtnWidth = 20;
export const dragBtnHeight = 10;
export const dragBtnRadius = 5;
