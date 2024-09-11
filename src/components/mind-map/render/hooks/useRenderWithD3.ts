import { D3DragEvent, drag } from 'd3-drag';
import { Selection, select, style } from 'd3-selection';
import { transition } from 'd3-transition';
import { MutableRefObject, useLayoutEffect, useRef, useState } from 'react';
import {
  getDragBtnPosXForDirection,
  getDragBtnPosYForDirection,
  getDraggingX,
  getDraggingY,
  getLinkForDirection,
  getLinkPointPairForDirection,
  getNodePosXForDirection,
  getNodePosYForDirection,
  isHorizontalDirection,
} from '../helpers';
import { preventDrag } from '../helpers/d3Helper';
import { Direction, NodeInterface, NodeLink } from '../layout';
import { RawNode, SizedRawNode } from '../node/interface';
export interface TreeState {
  dragging: boolean;
  direction: Direction;
  scale: number;
}

const dragBtnWidth = 20;
const dragBtnHeight = 10;

export function useRenderWithD3<D>(
  root: NodeInterface<SizedRawNode<D>>,
  direction: Direction,
) {
  const svg = useRef<SVGSVGElement>(null);
  const treeStateRef = useRef<TreeState>({
    direction,
    dragging: false,
    scale: 1,
  });

  const [pendingRenderNodes, setPendingRenderNodes] = useState<
    [SVGForeignObjectElement, SizedRawNode<D>][]
  >([]);

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
          gSl.attr('transform', `translate(${tx}, ${ty})`);
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
        .attr('transform', `translate(${tx}, ${ty})`);
      const g = drawing.node();
      if (g) {
        g.dataset.tx = tx.toString();
        g.dataset.ty = ty.toString();
      }
    }
    treeStateRef.current.direction = direction;
    const nodeDataPairs = drawTree(drawing, root, treeStateRef);
    setPendingRenderNodes(nodeDataPairs);
  }, [root, direction]);

  return { svg, pendingRenderNodes };
}

function drawTree<D>(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  drawing: Selection<SVGGElement, unknown, null, any>,
  tree: NodeInterface<SizedRawNode<D>>,
  treeState: MutableRefObject<TreeState>,
) {
  const drawTran = transition().duration(500);

  // for path
  const tempDrawingPath = drawing
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
  const tempDrawingNode = drawing
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
  gNode
    .append('foreignObject')
    .classed('node-content', true)
    .attr('rx', 5)
    .attr('ry', 5)
    .attr('width', (d) => d.data.content_size[0])
    .attr('height', (d) => d.data.content_size[1])
    .on('mouseenter', function (event, d) {
      console.log('mouseenter', treeState.current.dragging);
      if (treeState.current.dragging) {
        select<SVGGElement, NodeInterface<SizedRawNode<D>>>(this).classed(
          'dragging-hover',
          true,
        );
      }
    })
    .on('mouseleave', function (event, d) {
      console.log('mouseleave', treeState.current.dragging);
      if (treeState.current.dragging) {
        select<SVGGElement, NodeInterface<SizedRawNode<D>>>(this).classed(
          'dragging-hover',
          false,
        );
      }
    })
    .call(
      preventDrag<SVGForeignObjectElement, NodeInterface<SizedRawNode<D>>>(),
    );
  tempDrawingNode.exit().remove();

  // for drag button
  const tempDragNode = drawing
    .selectAll<SVGRectElement, NodeInterface<SizedRawNode<D>>>('rect.drag-btn')
    .data(tree.nodes(), (d) => {
      return d.data.id;
    })
    .call((update) => {
      update
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        .transition(drawTran as any)
        .attr(
          'width',
          isHorizontalDirection(treeState) ? dragBtnHeight : dragBtnWidth,
        )
        .attr(
          'height',
          isHorizontalDirection(treeState) ? dragBtnWidth : dragBtnHeight,
        )
        .attr('x', (d) => {
          return getDragBtnPosXForDirection(
            d.x,
            d,
            dragBtnWidth,
            dragBtnHeight,
            treeState,
          );
        })
        .attr('y', (d) => {
          return getDragBtnPosYForDirection(
            d.y,
            d,
            dragBtnWidth,
            dragBtnHeight,
            treeState,
          );
        });
    });

  tempDragNode
    .enter()
    .append('rect')
    .attr('class', (d) => {
      return `drag-btn _${d.data.id}${d.isRoot() ? ' root' : ''}`;
    })
    // .classed('drag-btn', true)
    .attr('rx', 5)
    .attr('ry', 5)
    .attr('fill', 'red')
    .attr('cursor', 'move')
    .attr('x', (d) => {
      return getDragBtnPosXForDirection(
        d.x,
        d,
        dragBtnWidth,
        dragBtnHeight,
        treeState,
      );
    })
    .attr('y', (d) => {
      return getDragBtnPosYForDirection(
        d.y,
        d,
        dragBtnWidth,
        dragBtnHeight,
        treeState,
      );
    })
    .attr(
      'width',
      isHorizontalDirection(treeState) ? dragBtnHeight : dragBtnWidth,
    )
    .attr(
      'height',
      isHorizontalDirection(treeState) ? dragBtnWidth : dragBtnHeight,
    );

  tempDragNode.call(
    drag<SVGRectElement, NodeInterface<SizedRawNode<D>>>()
      .on(
        'start',
        function onDragStart(
          event: D3DragEvent<
            SVGRectElement,
            NodeInterface<SizedRawNode<D>>,
            unknown
          >,
          node,
        ) {
          if (node.isRoot()) return;
          event.sourceEvent.preventDefault();
          event.sourceEvent.stopPropagation();
          treeState.current.dragging = true;

          select(<SVGRectElement>this).style('opacity', 0.3);
          select(`g.node._${node.data.id}`).style('opacity', 0.3);
          drawing
            .selectAll<SVGPathElement, NodeLink<SizedRawNode<D>>>(
              `path.line._${node.data.id}`,
            )
            .style('opacity', 0.15);
        },
      )
      .on(
        'drag',
        function onDart(
          event: D3DragEvent<
            SVGRectElement,
            NodeInterface<SizedRawNode<D>>,
            unknown
          >,
          node,
        ) {
          if (node.isRoot()) return;
          event.sourceEvent.preventDefault();
          event.sourceEvent.stopPropagation();
          // update drag btn position
          let x = getDragBtnPosXForDirection(
            event.x,
            node,
            dragBtnWidth,
            dragBtnHeight,
            treeState,
          );
          let y = getDragBtnPosYForDirection(
            event.y,
            node,
            dragBtnWidth,
            dragBtnHeight,
            treeState,
          );
          select(<SVGRectElement>this)
            .attr('x', x)
            .attr('y', y);

          // update node position
          const width = node.data.content_size[0];
          const height = node.data.content_size[1];
          x = getNodePosXForDirection(event.x, width, treeState);
          y = getNodePosYForDirection(event.y, height, treeState);
          select(`g.node._${node.data.id}`).attr(
            'transform',
            `translate(${x}, ${y})`,
          );
          node.draggingX = event.x;
          node.draggingY = event.y;
          // update link position
          drawing
            .selectAll<SVGPathElement, NodeLink<SizedRawNode<D>>>(
              `path.line._${node.data.id}`,
            )
            .data(node.touchedLinks(), (link) => {
              const key = `${link.source.data.id}-${link.target.data.id}`;
              return key;
            })
            .call((update) => {
              update.attr('d', (d) => {
                const sourceRect: [number, number, number, number] = [
                  getDraggingX(d.source),
                  getDraggingY(d.source),
                  d.source.data.content_size[0],
                  d.source.data.content_size[1],
                ];
                const targetRect: [number, number, number, number] = [
                  getDraggingX(d.target),
                  getDraggingY(d.target),
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
        },
      )
      .on(
        'end',
        function onDragEnd(
          event: D3DragEvent<
            SVGRectElement,
            NodeInterface<SizedRawNode<D>>,
            unknown
          >,
          node,
        ) {
          if (node.isRoot()) return;
          event.sourceEvent.preventDefault();
          event.sourceEvent.stopPropagation();
          treeState.current.dragging = false;

          const dragTran = transition().duration(300);

          // update drag btn position
          let x = getDragBtnPosXForDirection(
            node.x,
            node,
            dragBtnWidth,
            dragBtnHeight,
            treeState,
          );
          let y = getDragBtnPosYForDirection(
            node.y,
            node,
            dragBtnWidth,
            dragBtnHeight,
            treeState,
          );
          select(<SVGRectElement>this)
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            .transition(dragTran as any)
            .style('opacity', 1)
            .attr('x', x)
            .attr('y', y);

          // update node position
          const width = node.data.content_size[0];
          const height = node.data.content_size[1];
          x = getNodePosXForDirection(node.x, width, treeState);
          y = getNodePosYForDirection(node.y, height, treeState);
          select(`g.node._${node.data.id}`)
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            .transition(dragTran as any)
            .style('opacity', 1)
            .attr('transform', `translate(${x}, ${y})`);

          // clear dragging state
          node.draggingX = undefined;
          node.draggingY = undefined;

          // update link position
          drawing
            .selectAll<SVGPathElement, NodeLink<SizedRawNode<D>>>(
              `path.line._${node.data.id}`,
            )
            .style('opacity', 1)
            .data(node.touchedLinks(), (link) => {
              const key = `${link.source.data.id}-${link.target.data.id}`;
              return key;
            })
            .call((update) => {
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
              update.transition(dragTran as any).attr('d', (d) => {
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
        },
      ),
  );
  tempDragNode.exit().remove();

  const nodeDataPairs: [SVGForeignObjectElement, SizedRawNode<D>][] = [];
  tempDrawingNode.each(function (d) {
    nodeDataPairs.push([<SVGForeignObjectElement>this.children[0], d.data]);
  });

  return nodeDataPairs;
}
