import { Selection, select } from 'd3-selection';
import { transition } from 'd3-transition';
import { drag, D3DragEvent } from 'd3-drag';
import { useLayoutEffect, useRef, MutableRefObject } from 'react';
import {
  getLinkForDirection,
  getLinkPointPairForDirection,
  getNodePosXForDirection,
  getNodePosYForDirection,
  getDraggingX,
  getDraggingY,
} from '../helpers';
import { Direction, NodeInterface, NodeLink } from '../layout';
import { RawNode, SizedRawNode } from '../node/interface';

export function useRenderWithD3<D>(
  root: NodeInterface<SizedRawNode<D>>,
  direction: Direction,
) {
  const svg = useRef<SVGSVGElement>(null);
  const directionRef = useRef<Direction>(direction);

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
    directionRef.current = direction;
    drawTree(drawing, root, directionRef);
  }, [root, direction]);

  return svg;
}

function drawTree<D>(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  drawing: Selection<SVGGElement, unknown, null, any>,
  tree: NodeInterface<SizedRawNode<D>>,
  direction: MutableRefObject<Direction>,
) {
  const drawTran = transition().duration(500);

  // for node
  const tempDrawingNode = drawing
    .selectAll<SVGRectElement, NodeInterface<SizedRawNode<D>>>('rect.node')
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
          return getNodePosXForDirection(d.x, width, direction);
        })
        .attr('y', (d) => {
          const height = d.data.content_size[1];
          return getNodePosYForDirection(d.y, height, direction);
        });
    });

  tempDrawingNode
    .enter()
    .append('rect')
    .attr('class', 'node')
    .attr('rx', 5)
    .attr('ry', 5)
    .attr('x', (d) => {
      const width = d.data.content_size[0];
      return getNodePosXForDirection(d.x, width, direction);
    })
    .attr('y', (d) => {
      const height = d.data.content_size[1];
      return getNodePosYForDirection(d.y, height, direction);
    })
    .attr('width', (d) => d.data.content_size[0])
    .attr('height', (d) => d.data.content_size[1])
    .call(
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

            select(this).style('opacity', 0.3);
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
            // update node position
            const width = node.data.content_size[0];
            const x = getNodePosXForDirection(event.x, width, direction);
            const height = node.data.content_size[1];
            const y = getNodePosYForDirection(event.y, height, direction);
            select(<SVGRectElement>this)
              .attr('x', x)
              .attr('y', y);
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
                    direction,
                    sourceRect,
                    targetRect,
                  );
                  const re =
                    getLinkForDirection(direction)(linkPointPair) || '';
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

            const dragTran = transition().duration(300);
            // update node position
            const width = node.data.content_size[0];
            const x = getNodePosXForDirection(node.x, width, direction);
            const height = node.data.content_size[1];
            const y = getNodePosYForDirection(node.y, height, direction);
            select(<SVGRectElement>this).style('opacity', 1);
            select(<SVGRectElement>this)
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
              .transition(dragTran as any)
              .attr('x', x)
              .attr('y', y);

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
                    direction,
                    sourceRect,
                    targetRect,
                  );
                  const re =
                    getLinkForDirection(direction)(linkPointPair) || '';
                  return re;
                });
              });
          },
        ),
    );

  tempDrawingNode.exit().remove();

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
            direction,
            sourceRect,
            targetRect,
          );
          const re = getLinkForDirection(direction)(linkPointPair) || '';
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
        direction,
        sourceRect,
        targetRect,
      );
      const re = getLinkForDirection(direction)(linkPointPair) || '';
      return re;
    })
    .attr('fill', 'transparent')
    .attr('stroke', 'green');

  tempDrawingPath.exit().remove();
}
