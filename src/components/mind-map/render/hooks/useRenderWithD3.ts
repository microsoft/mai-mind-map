import { drag } from 'd3-drag';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { type EditingNodeType } from '../../EditingNode';
import {
  getLinkForDirection,
  getLinkPointPairForDirection,
  getPaddingForDirection,
} from '../helpers';

import { Direction, NodeInterface, NodeLink } from '../layout';
import { SizedRawNode } from '../node/interface';
import { type Drawing, type TreeState } from './constants';
import { dragAction, handleDragItemHoverOnAction } from './dragAction';

export function useRenderWithD3<D>(
  root: NodeInterface<SizedRawNode<D>> | null,
  direction: Direction,
  scale: number,
  moveNodeTo: (nodeId: string, targetId: string, index: number) => void,
  setEditingNode: (node: EditingNodeType<D> | null) => void,
) {
  const svg = useRef<SVGSVGElement>(null);
  const treeStateRef = useRef<TreeState<D>>({
    direction,
    dragging: false,
    scale: scale,
    moveNodeTo: () => {
      throw new Error('moveNodeTo not implemented');
    },
    setEditingNode: setEditingNode,
  });

  const [pendingRenderNodes, setPendingRenderNodes] = useState<
    [SVGForeignObjectElement, NodeInterface<SizedRawNode<D>>][]
  >([]);

  const [drawing, setDrawing] = useState<Drawing | null>(null);

  useLayoutEffect(() => {
    if (!svg.current) return;
    const svgSl = select(svg.current);
    svgSl.call(
      drag<SVGSVGElement, unknown>()
        .on('start', (event) => {
          treeStateRef.current.setEditingNode(null);
        })
        .on('drag', function (event) {
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

    if (drawing.empty()) {
      drawing = svgSl.append('g').classed('drawing', true);

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
      if (g && svg.current) {
        const { clientWidth, clientHeight } = svg.current;
        const { v, h } = getPaddingForDirection(treeStateRef.current.direction);
        const tx = +(g.dataset.tx || clientWidth / 2 + 2 * h);
        const ty = +(g.dataset.ty || clientHeight / 2 + 2 * v);
        if (tx && ty) {
          drawing.drawingGroup.attr(
            'transform',
            `translate(${tx}, ${ty}) scale(${scale})`,
          );
        }
        g.dataset.tx = tx.toString();
        g.dataset.ty = ty.toString();
      }
    }
  }, [scale, drawing]);

  useEffect(() => {
    treeStateRef.current.direction = direction;
    treeStateRef.current.moveNodeTo = moveNodeTo;
    treeStateRef.current.setEditingNode = setEditingNode;
    if (drawing && root) {
      const nodeDataPairs = drawTree(drawing, root, treeStateRef);
      setPendingRenderNodes(nodeDataPairs);
    }
  }, [drawing, direction, root, moveNodeTo, setEditingNode]);

  return { svg, pendingRenderNodes };
}

function drawTree<D>(
  drawing: Drawing,
  tree: NodeInterface<SizedRawNode<D>>,
  treeState: MutableRefObject<TreeState<D>>,
) {
  console.log('drawTree');
  const drawTran = transition().duration(500);

  // for path
  const tempDrawingPath = drawing.pathGroup
    .selectAll<SVGPathElement, NodeLink<SizedRawNode<D>>>('path.line')
    .data(tree.links(), (link) => {
      const key = `l-${link.target.data.id}`;
      return key;
    })
    .call((update) => {
      update

        .transition(drawTran as any)
        .style('opacity', (d) =>
          d.target.inCollapsedItem || d.source.inCollapsedItem ? '0' : '1',
        )
        .attr('d', (d) => {
          const sourceRect: [number, number, number, number, number, number] = [
            d.source.x,
            d.source.y,
            d.source.data.content_size[0],
            d.source.data.content_size[1],
            d.source.x,
            d.source.y,
          ];

          const targetRect: [number, number, number, number, number, number] = [
            d.target.x,
            d.target.y,
            d.target.data.content_size[0],
            d.target.data.content_size[1],
            d.target.x,
            d.target.y,
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
    .style('opacity', (d) =>
      d.target.inCollapsedItem || d.source.inCollapsedItem ? '0' : '1',
    )
    .attr('d', (d) => {
      const sourceRect: [number, number, number, number, number, number] = [
        d.source.x,
        d.source.y,
        d.source.data.content_size[0],
        d.source.data.content_size[1],
        d.source.x,
        d.source.y,
      ];

      const targetRect: [number, number, number, number, number, number] = [
        d.target.x,
        d.target.y,
        d.target.data.content_size[0],
        d.target.data.content_size[1],
        d.target.x,
        d.target.y,
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
    .attr('stroke', '#0172DC');

  tempDrawingPath.exit().remove();

  // for node
  const tempDrawingNode = drawing.nodeGroup
    .selectAll<SVGRectElement, NodeInterface<SizedRawNode<D>>>(
      'foreignObject.node',
    )
    .data(tree.nodes(), (d) => {
      return d.data.id;
    })
    .call((update) => {
      const gNode = update

        .transition(drawTran as any)
        .style('opacity', (d) => (d.inCollapsedItem ? '0' : '1'))
        .style('pointer-events', (d) => (d.inCollapsedItem ? 'none' : ''))
        .attr('width', (d) => d.data.content_size[0])
        .attr('height', (d) => d.data.content_size[1])
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y)
        .attr('ry', (d) => {
          // notify editing box's content data via event
          window.dispatchEvent(
            new CustomEvent(`update-data-${d.data.id}`, {
              detail: d,
            }),
          );
          return '5';
        })
        .attrTween('rx', function (d) {
          const oldX = this.x.baseVal.value;
          const oldY = this.y.baseVal.value;
          return (t) => {
            const newX = d.x * t + oldX * (1 - t);
            const newY = d.y * t + oldY * (1 - t);
            // notify editing box's position via event
            window.dispatchEvent(
              new CustomEvent(`update-pos-${d.data.id}`, {
                detail: [newX, newY],
              }),
            );
            return '5';
          };
        });
    });

  const foreignObject = tempDrawingNode
    .enter()
    .append('foreignObject')
    .style('opacity', (d) => (d.inCollapsedItem ? '0' : '1'))
    .style('pointer-events', (d) => (d.inCollapsedItem ? 'none' : ''))

    .attr('class', (d) => {
      return `node node-content _${d.data.id}`;
    })
    .attr('rx', 5)
    .attr('ry', 5)
    .attr('width', (d) => d.data.content_size[0])
    .attr('height', (d) => d.data.content_size[1])
    .attr('x', (d) => d.x)
    .attr('y', (d) => d.y)
    .on('click', (event: PointerEvent, d) => {
      if (!(event.target as HTMLElement).classList.contains('drag-btn')) {
        return;
      }
      const drawingEl = <SVGGElement>drawing.drawingGroup.node();
      const tx = +(drawingEl.dataset.tx || 0);
      const ty = +(drawingEl.dataset.ty || 0);
      treeState.current.setEditingNode({
        node: d,
        translate: [tx, ty],
      });
    });

  handleDragItemHoverOnAction<D, SVGForeignObjectElement>(
    foreignObject,
    treeState,
  );

  tempDrawingNode.exit().remove();

  drawing.nodeGroup
    .selectAll<SVGRectElement, NodeInterface<SizedRawNode<D>>>(
      'foreignObject.node',
    )
    .call(dragAction<D>(drawing, treeState));

  const nodeDataPairs: [
    SVGForeignObjectElement,
    NodeInterface<SizedRawNode<D>>,
  ][] = [];

  drawing.nodeGroup
    .selectAll<SVGForeignObjectElement, NodeInterface<SizedRawNode<D>>>(
      'foreignObject.node',
    )
    .each(function (d) {
      nodeDataPairs.push([this, d]);
    });

  return nodeDataPairs;
}
