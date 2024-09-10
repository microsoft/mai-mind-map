import { Selection, select } from 'd3-selection';
import { transition } from 'd3-transition';
import { useLayoutEffect, useRef } from 'react';
import {
  getLinkForDirection,
  getLinkPointPairForDirection,
  getNodePosXForDirection,
  getNodePosYForDirection,
} from '../helpers';
import { Direction, NodeInterface, NodeLink } from '../layout';
import { RawNode, SizedRawNode } from '../node/interface';

export function useRenderWithD3<D>(
  root: NodeInterface<SizedRawNode<D>>,
  direction: Direction,
) {
  const svg = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    if (!svg.current) return;
    const svgSl = select(svg.current);
    let drawing = svgSl.select<SVGGElement>('g.drawing');
    const { clientWidth, clientHeight } = svg.current;
    if (drawing.empty()) {
      drawing = svgSl
        .append('g')
        .classed('drawing', true)
        .attr(
          'transform',
          `translate(${clientWidth / 2}, ${clientHeight / 2})`,
        );
    }
    drawTree(drawing, root, direction);
  }, [root, direction]);

  return svg;
}

function drawTree<D>(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  drawing: Selection<SVGGElement, unknown, null, any>,
  tree: NodeInterface<SizedRawNode<D>>,
  direction: Direction,
) {
  const t = transition('34444').duration(500);
  // selectAll('.node').transition(t).attr('transform', 'translate(50, 60)');
  // for rect
  const tempDrawingNode = drawing
    .selectAll<SVGGElement, NodeInterface<SizedRawNode<D>>>('.node')
    .data(tree.nodes(), (d) => {
      return d.data.id;
    })
    .call((update) => {
      console.log('update', update);
      update
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        .transition(t as any)
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
    .attr('height', (d) => d.data.content_size[1]);

  tempDrawingNode.exit().remove();

  // for path
  const tempDrawingPath = drawing
    .selectAll<SVGAElement, NodeLink<SizedRawNode<D>>>('.line')
    .data(tree.links(), (link) => {
      const key = `${link.source.data.id}-${link.target.data.id}`;
      return key;
    })
    .call((update) => {
      update
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        .transition(t as any)
        .attr('d', (d) => {
          // const linkPointPair: {
          //   source: [number, number];
          //   target: [number, number];
          // } = {
          //   source: [d.source.x, d.source.y + d.source.data.content_size[1]],
          //   target: [d.target.x, d.target.y],
          // };
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
    .attr('class', 'line')
    .attr('d', (d) => {
      // const linkPointPair: {
      //   source: [number, number];
      //   target: [number, number];
      // } = {
      //   source: [d.source.x, d.source.y + d.source.data.content_size[1]],
      //   target: [d.target.x, d.target.y],
      // };
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