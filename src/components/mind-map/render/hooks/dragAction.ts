import { D3DragEvent, drag } from 'd3-drag';
import { Selection, select } from 'd3-selection';
import { transition } from 'd3-transition';
import { MutableRefObject } from 'react';
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
import { NodeInterface, NodeLink } from '../layout';
import { SizedRawNode } from '../node/interface';
import {
  type TreeState,
  dragBtnHeight,
  dragBtnRadius,
  dragBtnWidth,
} from './constants';
const draggingItemOverClass = 'dragging-item-over';

// Handle the action that some item is dragged over the node
export function handleDragItemHoverOnAction<D, E extends Element>(
  sl: Selection<E, NodeInterface<SizedRawNode<D>>, SVGGElement, unknown>,
  treeState: MutableRefObject<TreeState>,
) {
  sl.on('mouseenter', function (event, d) {
    console.log('mouseenter', treeState.current.dragging);
    if (treeState.current.dragging) {
      select<E, NodeInterface<SizedRawNode<D>>>(this).classed(
        draggingItemOverClass,
        true,
      );
    }
  })
    .on('mouseleave', function (event, d) {
      console.log('mouseleave', treeState.current.dragging);
      if (treeState.current.dragging) {
        select<E, NodeInterface<SizedRawNode<D>>>(this).classed(
          draggingItemOverClass,
          false,
        );
      }
    })
    .call(preventDrag<E, NodeInterface<SizedRawNode<D>>>());
}

export function dragAction<D>(
  drawing: Selection<SVGGElement, unknown, null, undefined>,
  treeState: MutableRefObject<TreeState>,
) {
  return drag<SVGRectElement, NodeInterface<SizedRawNode<D>>>()
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

        // drag btn
        const btn = select(<SVGRectElement>this);
        btn.style('opacity', 0);
        // draw shadow btn
        drawing
          .append('rect')
          .attr('class', 'dragging-btn')
          .attr(
            'x',
            getDragBtnPosXForDirection(
              node.x,
              node,
              dragBtnWidth,
              dragBtnHeight,
              treeState,
            ),
          )
          .attr(
            'y',
            getDragBtnPosYForDirection(
              node.y,
              node,
              dragBtnWidth,
              dragBtnHeight,
              treeState,
            ),
          )
          .attr('rx', dragBtnRadius)
          .attr('ry', dragBtnRadius)
          .attr(
            'width',
            isHorizontalDirection(treeState) ? dragBtnHeight : dragBtnWidth,
          )
          .attr(
            'height',
            isHorizontalDirection(treeState) ? dragBtnWidth : dragBtnHeight,
          )
          .attr('fill', 'red')
          .style('opacity', 0.3)
          .style('pointer-events', 'none');

        // node
        drawing
          .select(`g.node._${node.data.id}`)
          .style('opacity', 0.3)
          .style('pointer-events', 'none');

        // link
        drawing
          .selectAll<SVGPathElement, NodeLink<SizedRawNode<D>>>(
            `path.line._${node.data.id}`,
          )
          .style('opacity', 0.2);
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
        // update shadow drag btn position
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
        drawing.select('rect.dragging-btn').attr('x', x).attr('y', y);

        // update node position
        const width = node.data.content_size[0];
        const height = node.data.content_size[1];
        x = getNodePosXForDirection(event.x, width, treeState);
        y = getNodePosYForDirection(event.y, height, treeState);
        drawing
          .select(`g.node._${node.data.id}`)
          .attr('transform', `translate(${x}, ${y})`);
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

        // remove shadow drag btn
        drawing.select('rect.dragging-btn').remove();
        // update drag btn position to the end position
        const dragBtn = select(<SVGRectElement>this).style('opacity', 1);
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
        dragBtn.attr('x', x).attr('y', y);

        // restore node opacity and other styles
        const nodeItem = drawing
          .select(`g.node._${node.data.id}`)
          .style('pointer-events', '')
          .style('opacity', 1);
        // clear dragging state
        node.draggingX = undefined;
        node.draggingY = undefined;

        // restore link opacity

        const linkLine = drawing
          .selectAll<SVGPathElement, NodeLink<SizedRawNode<D>>>(
            `path.line._${node.data.id}`,
          )
          .style('opacity', 1);

        // 1. check if this item should be dropped on another item
        const overNodes = drawing.selectAll<
          SVGForeignObjectElement,
          NodeInterface<SizedRawNode<D>>
        >(`foreignObject.${draggingItemOverClass}`);
        if (overNodes.data().length) {
          overNodes.classed(draggingItemOverClass, false);
          const from = node.data;
          const to = overNodes.data()[0].data;

          if (to.id !== node.parent?.data.id) {
            treeState.current.moveNodeTo(from.id, to.id, 0);
            return;
          }
        }

        // 2. check if this item should change order with its sibling

        // 3. animate to the original position

        const dragTran = transition().duration(300);

        // animate drag btn to final position
        x = getDragBtnPosXForDirection(
          node.x,
          node,
          dragBtnWidth,
          dragBtnHeight,
          treeState,
        );
        y = getDragBtnPosYForDirection(
          node.y,
          node,
          dragBtnWidth,
          dragBtnHeight,
          treeState,
        );

        dragBtn
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          .transition(dragTran as any)
          .attr('x', x)
          .attr('y', y);

        // animate node to original position
        const width = node.data.content_size[0];
        const height = node.data.content_size[1];
        x = getNodePosXForDirection(node.x, width, treeState);
        y = getNodePosYForDirection(node.y, height, treeState);
        nodeItem
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          .transition(dragTran as any)
          .attr('transform', `translate(${x}, ${y})`);

        // update link to original position
        linkLine
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
    );
}
