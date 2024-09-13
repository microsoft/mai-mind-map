import { Selection } from 'd3-selection';
import { Direction } from '../layout/flex-tree/hierarchy';
export interface TreeState {
  dragging: boolean;
  direction: Direction;
  scale: number;
  moveNodeTo: (nodeId: string, targetId: string, index: number) => void;
}
export interface Drawing {
  drawingGroup: Selection<SVGGElement, unknown, null, undefined>;
  dragGroup: Selection<SVGGElement, unknown, null, undefined>;
  nodeGroup: Selection<SVGGElement, unknown, null, undefined>;
  pathGroup: Selection<SVGGElement, unknown, null, undefined>;
}
