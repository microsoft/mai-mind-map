import { drag } from 'd3-drag';
import { Selection, select, style } from 'd3-selection';
import { transition } from 'd3-transition';
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  getDragBtnPosXForDirection,
  getDragBtnPosYForDirection,
  getLinkForDirection,
  getLinkPointPairForDirection,
  getNodePosXForDirection,
  getNodePosYForDirection,
  isHorizontalDirection,
} from '../helpers';

import { Direction, NodeInterface, NodeLink } from '../layout';
import { SizedRawNode } from '../node/interface';
import { type Drawing, type TreeState, dragBtnRadius } from './constants';
import { dragAction, handleDragItemHoverOnAction } from './dragAction';

export function useRenderWithD3<D>(
  root: NodeInterface<SizedRawNode<D>>,
  direction: Direction,
  scale: number,
  moveNodeTo: (nodeId: string, targetId: string, index: number) => void,
) {
  const svg = useRef<SVGSVGElement>(null);
  const treeStateRef = useRef<TreeState>({
    direction,
    dragging: false,
    scale: scale,
    moveNodeTo: () => {
      throw new Error('moveNodeTo not implemented');
    },
  });

  const [pendingRenderNodes, setPendingRenderNodes] = useState<
    [SVGForeignObjectElement, SizedRawNode<D>][]
  >([]);

  const [drawing, setDrawing] = useState<Drawing | null>(null);

  useLayoutEffect(() => {
    if (!svg.current) return;
    const svgSl = select(svg.current);
    svgSl.call(
      drag<SVGSVGElement, unknown>().on('drag', function (event) {
        event.sourceEvent.preventDefault();
        event.sourceEvent.stopPropagation();
        const gSl = select(this).select<SVGGElement>('g.drawing');
        const g = gSl.node();
        if (g) {
          const tx = +(g.dataset.tx || 0) + event.dx;
          const ty = +(g.dataset.ty || 0) + event.dy;
          gSl.attr(
            'transform',
            `translate(${tx}, ${ty}) scale(${treeStateRef.current.scale})`,
          );
          g.dataset.tx = tx;
          g.dataset.ty = ty;
        }
      }),
    );

    let drawing = svgSl.select<SVGGElement>('g.drawing');

    const { clientWidth, clientHeight } = svg.current;
    if (drawing.empty()) {
      const tx = clientWidth / 2;
      const ty = clientHeight / 2;
      drawing = svgSl
        .append('g')
        .classed('drawing', true)
        .attr(
          'transform',
          `translate(${tx}, ${ty}) scale(${treeStateRef.current.scale})`,
        );
      const g = drawing.node();
      if (g) {
        g.dataset.tx = tx.toString();
        g.dataset.ty = ty.toString();
      }
      const pathGroup = drawing.append('g').classed('path-group', true);
      const nodeGroup = drawing.append('g').classed('node-group', true);
      const dragGroup = drawing.append('g').classed('drag-group', true);
      setDrawing({
        drawingGroup: drawing,
        dragGroup,
        nodeGroup,
        pathGroup,
      });
    }
  }, []);

  useEffect(() => {
    treeStateRef.current.scale = scale;

    if (drawing) {
      const g = drawing.drawingGroup.node();
      if (g) {
        const tx = g.dataset.tx;
        const ty = g.dataset.ty;
        if (tx && ty) {
          drawing.drawingGroup.attr(
            'transform',
            `translate(${tx}, ${ty}) scale(${scale})`,
          );
        }
        g.dataset.tx = tx;
        g.dataset.ty = ty;
      }
    }
  }, [scale, drawing]);

  useEffect(() => {
    treeStateRef.current.direction = direction;
    treeStateRef.current.moveNodeTo = moveNodeTo;
    if (drawing) {
      const nodeDataPairs = drawTree(drawing, root, treeStateRef);
      setPendingRenderNodes(nodeDataPairs);
    }
  }, [drawing, direction, root, moveNodeTo]);

  return { svg, pendingRenderNodes };
}

function drawTree<D>(
  drawing: Drawing,
  tree: NodeInterface<SizedRawNode<D>>,
  treeState: MutableRefObject<TreeState>,
) {
  const drawTran = transition().duration(500);

  // for path
  const tempDrawingPath = drawing.pathGroup
    .selectAll<SVGPathElement, NodeLink<SizedRawNode<D>>>('path.line')
    .data(tree.links(), (link) => {
      const key = `${link.source.data.id}-${link.target.data.id}`;
      return key;
    })
    .call((update) => {
      update
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        .transition(drawTran as any)
        .attr('d', (d) => {
          const sourceRect: [number, number, number, number] = [
            d.source.x,
            d.source.y,
            d.source.data.content_size[0],
            d.source.data.content_size[1],
          ];

          const targetRect: [number, number, number, number] = [
            d.target.x,
            d.target.y,
            d.target.data.content_size[0],
            d.target.data.content_size[1],
          ];
          const linkPointPair = getLinkPointPairForDirection(
            treeState,
            sourceRect,
            targetRect,
          );
          const re = getLinkForDirection(treeState)(linkPointPair) || '';
          return re;
        });
    });

  tempDrawingPath
    .enter()
    .append('path')
    .attr('class', (d) => {
      return `line _${d.source.data.id} _${d.target.data.id}`;
    })
    .attr('d', (d) => {
      const sourceRect: [number, number, number, number] = [
        d.source.x,
        d.source.y,
        d.source.data.content_size[0],
        d.source.data.content_size[1],
      ];

      const targetRect: [number, number, number, number] = [
        d.target.x,
        d.target.y,
        d.target.data.content_size[0],
        d.target.data.content_size[1],
      ];
      const linkPointPair = getLinkPointPairForDirection(
        treeState,
        sourceRect,
        targetRect,
      );
      const re = getLinkForDirection(treeState)(linkPointPair) || '';
      return re;
    })
    .attr('fill', 'transparent')
    .attr('stroke', 'green');

  tempDrawingPath.exit().remove();

  // for node
  const tempDrawingNode = drawing.nodeGroup
    .selectAll<SVGRectElement, NodeInterface<SizedRawNode<D>>>('g.node')
    .data(tree.nodes(), (d) => {
      return d.data.id;
    })
    .call((update) => {
      const gNode = update
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        .transition(drawTran as any)
        .attr('width', (d) => d.data.content_size[0])
        .attr('height', (d) => d.data.content_size[1])
        .attr('transform', (d) => {
          const width = d.data.content_size[0];
          const x = getNodePosXForDirection(d.x, width, treeState);
          const height = d.data.content_size[1];
          const y = getNodePosYForDirection(d.y, height, treeState);
          return `translate(${x}, ${y})`;
        });
      gNode
        .select('rect.node-content')
        .attr('width', (d) => d.data.content_size[0])
        .attr('height', (d) => d.data.content_size[1]);
    });

  const gNode = tempDrawingNode
    .enter()
    .append('g')
    .attr('class', (d) => {
      return `node _${d.data.id}`;
    })
    .attr('transform', (d) => {
      const width = d.data.content_size[0];
      const x = getNodePosXForDirection(d.x, width, treeState);
      const height = d.data.content_size[1];
      const y = getNodePosYForDirection(d.y, height, treeState);
      return `translate(${x}, ${y})`;
    });

  // Determine the space size of the node
  const foreignObject = gNode
    .append('foreignObject')
    .classed('node-content', true)
    .attr('rx', 5)
    .attr('ry', 5)
    .attr('width', (d) => d.data.content_size[0])
    .attr('height', (d) => d.data.content_size[1]);

  handleDragItemHoverOnAction<D, SVGForeignObjectElement>(
    foreignObject,
    treeState,
  );

  tempDrawingNode.exit().remove();

  // for drag button
  const tempDragNode = drawing.dragGroup
    .selectAll<SVGRectElement, NodeInterface<SizedRawNode<D>>>('rect.drag-btn')
    .data(tree.nodes(), (d) => {
      return d.data.id;
    })
    .call((update) => {
      update
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        .transition(drawTran as any)
        .attr('width', (d) => d.data.content_size[0])
        .attr('height', (d) => d.data.content_size[1])
        .attr('x', (d) => {
          const width = d.data.content_size[0];
          return getNodePosXForDirection(d.x, width, treeState);
        })
        .attr('y', (d) => {
          const height = d.data.content_size[1];
          return getNodePosYForDirection(d.y, height, treeState);
        });
    });

  tempDragNode
    .enter()
    .append('rect')
    .attr('class', (d) => {
      return `drag-btn _${d.data.id}${d.isRoot() ? ' root' : ''}`;
    })
    .attr('rx', dragBtnRadius)
    .attr('ry', dragBtnRadius)
    .attr('fill', 'transparent')
    .attr('x', (d) => {
      const width = d.data.content_size[0];
      return getNodePosXForDirection(d.x, width, treeState);
    })
    .attr('y', (d) => {
      const height = d.data.content_size[1];
      return getNodePosYForDirection(d.y, height, treeState);
    })
    .attr('width', (d) => d.data.content_size[0])
    .attr('height', (d) => d.data.content_size[1]);

  tempDragNode.exit().remove();

  drawing.dragGroup
    .selectAll<SVGRectElement, NodeInterface<SizedRawNode<D>>>('rect.drag-btn')
    .call(dragAction<D>(drawing, treeState));

  const nodeDataPairs: [SVGForeignObjectElement, SizedRawNode<D>][] = [];

  drawing.nodeGroup
    .selectAll<SVGForeignObjectElement, NodeInterface<SizedRawNode<D>>>(
      'foreignObject.node-content',
    )
    .each(function (d) {
      nodeDataPairs.push([<SVGForeignObjectElement>this, d.data]);
    });

  return nodeDataPairs;
}
