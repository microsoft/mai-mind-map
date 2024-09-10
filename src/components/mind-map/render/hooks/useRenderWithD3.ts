import { D3DragEvent, drag } from 'd3-drag';
import { Selection, select } from 'd3-selection';
import { transition } from 'd3-transition';
import { MutableRefObject, useLayoutEffect, useRef, useState } from 'react';
import {
  getDraggingX,
  getDraggingY,
  getLinkForDirection,
  getLinkPointPairForDirection,
  getNodePosXForDirection,
  getNodePosYForDirection,
} from '../helpers';
import { Direction, NodeInterface, NodeLink } from '../layout';
import { RawNode, SizedRawNode } from '../node/interface';
const dragBtnWidth = 20;
const dragBtnHeight = 20;

export function useRenderWithD3<D>(
  root: NodeInterface<SizedRawNode<D>>,
  direction: Direction,
) {
  const svg = useRef<SVGSVGElement>(null);
  const directionRef = useRef<Direction>(direction);

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
    directionRef.current = direction;
    const nodeDataPairs = drawTree(drawing, root, directionRef);
    setPendingRenderNodes(nodeDataPairs);
  }, [root, direction]);

  return { svg, pendingRenderNodes };
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
          const x = getNodePosXForDirection(d.x, width, direction);
          const height = d.data.content_size[1];
          const y = getNodePosYForDirection(d.y, height, direction);
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
      const x = getNodePosXForDirection(d.x, width, direction);
      const height = d.data.content_size[1];
      const y = getNodePosYForDirection(d.y, height, direction);
      return `translate(${x}, ${y})`;
    });

  // Determine the space size of the node
  gNode
    .append('foreignObject')
    .classed('node-content', true)
    .attr('rx', 5)
    .attr('ry', 5)
    .attr('width', (d) => d.data.content_size[0])
    .attr('height', (d) => d.data.content_size[1]);

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
        .attr('width', dragBtnWidth)
        .attr('height', dragBtnHeight)
        .attr('x', (d) => {
          const width = d.data.content_size[0];
          return getNodePosXForDirection(d.x, dragBtnWidth, direction);
        })
        .attr('y', (d) => {
          const height = d.data.content_size[1];
          return getNodePosYForDirection(d.y, dragBtnHeight, direction);
        });
    });
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

  tempDragNode
    .enter()
    .append('rect')
    .attr('class', (d) => {
      return `drag-btn _${d.data.id}`;
    })
    // .classed('drag-btn', true)
    .attr('rx', 10)
    .attr('ry', 10)
    .attr('fill', 'red')
    .attr('x', (d) => {
      const width = d.data.content_size[0];
      return getNodePosXForDirection(d.x, dragBtnWidth, direction);
    })
    .attr('y', (d) => {
      const height = d.data.content_size[1];
      return getNodePosYForDirection(d.y, dragBtnHeight, direction);
    })
    .attr('width', dragBtnWidth)
    .attr('height', dragBtnHeight)
    .attr('cursor', 'move')
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
            // update node position
            const width = node.data.content_size[0];
            const height = node.data.content_size[1];
            let x = getNodePosXForDirection(event.x, dragBtnWidth, direction);
            let y = getNodePosYForDirection(event.y, dragBtnHeight, direction);
            select(<SVGRectElement>this)
              .attr('x', x)
              .attr('y', y);
            x = getNodePosXForDirection(event.x, width, direction);
            y = getNodePosYForDirection(event.y, height, direction);
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
            const height = node.data.content_size[1];
            let x = getNodePosXForDirection(node.x, dragBtnWidth, direction);
            let y = getNodePosYForDirection(node.y, dragBtnHeight, direction);
            select(<SVGRectElement>this)
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
              .transition(dragTran as any)
              .style('opacity', 1)
              .attr('x', x)
              .attr('y', y);
            x = getNodePosXForDirection(node.x, width, direction);
            y = getNodePosYForDirection(node.y, height, direction);
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
  tempDragNode.exit().remove();

  const nodeDataPairs: [SVGForeignObjectElement, SizedRawNode<D>][] = [];
  tempDrawingNode.each(function (d) {
    nodeDataPairs.push([<SVGForeignObjectElement>this.children[0], d.data]);
  });

  return nodeDataPairs;
}
