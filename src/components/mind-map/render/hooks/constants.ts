import { Selection } from 'd3-selection';
import { type EditingNodeType } from '../../EditingNode';
import { Direction } from '../layout/flex-tree/hierarchy';
import { NodeInterface } from '../layout/interface';
import { SizedRawNode } from '../node/interface';

export enum LinkMode {
  CURVE = 1,
  LINE = 2,
  HYBRID = 3,
}

export enum ColorMode {
  DEFAULT = 1,
  CUSTOM = 2,
}

export interface RenderOptions {
  direction: Direction;
  scale: number;
  linkMode: LinkMode;
  colorMode: ColorMode;
}

export interface TreeState<D> {
  dragging: boolean;
  direction: Direction;
  scale: number;
  linkMode: LinkMode;
  colorMode: ColorMode;
  moveNodeTo: (nodeId: string, targetId: string, index: number) => void;
  setEditingNode: (node: EditingNodeType<D> | null) => void;
}
export interface Drawing {
  drawingGroup: Selection<SVGGElement, unknown, null, undefined>;
  dragGroup: Selection<SVGGElement, unknown, null, undefined>;
  nodeGroup: Selection<SVGGElement, unknown, null, undefined>;
  pathGroup: Selection<SVGGElement, unknown, null, undefined>;
}
