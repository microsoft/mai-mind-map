import { D3DragEvent, drag } from 'd3-drag';
import { Selection, select } from 'd3-selection';
import { transition } from 'd3-transition';
import { MutableRefObject } from 'react';
import {
  getLinkForDirection,
  getLinkForDirectionV2,
  getLinkPointPairForDirection,
} from '../helpers';
import { preventDrag } from '../helpers/d3Helper';
import { NodeInterface, NodeLink } from '../layout';
import { SizedRawNode } from '../node/interface';
import { type Drawing, type TreeState } from './constants';
const draggingItemOverClass = 'dragging-item-over';

// Handle the action that some item is dragged over the node
export function handleDragItemHoverOnAction<D, E extends Element>(
  sl: Selection<E, NodeInterface<SizedRawNode<D>>, SVGGElement, unknown>,
  treeState: MutableRefObject<TreeState<D>>,
) {
  sl.on('mouseenter', function (event, d) {
    if (treeState.current.dragging) {
      select<E, NodeInterface<SizedRawNode<D>>>(this).classed(
        draggingItemOverClass,
        true,
      );
    }
  })
    .on('mouseleave', function (event, d) {
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
  drawing: Drawing,
  treeState: MutableRefObject<TreeState<D>>,
) {
  let cachedAnchorPoint: SVGGElement | undefined;
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
        if (node.isRoot() || !node.parent) return;
        event.sourceEvent.preventDefault();
        event.sourceEvent.stopPropagation();
        if (
          !(event.sourceEvent.target as HTMLElement).classList.contains(
            'drag-btn',
          )
        ) {
          return;
        }
        treeState.current.dragging = true;

        // add shadow Node
        drawing.nodeGroup
          .append('rect')
          .attr('class', 'shadow-dragging')
          .attr('opacity', 1)

          .attr('x', node.x)
          .attr('y', node.y)
          .attr('rx', 5)
          .attr('ry', 5)
          .attr('width', node.data.content_size[0])
          .attr('height', node.data.content_size[1])
          .attr('fill', 'rgba(24, 144, 255, 0.6)');

        // // add shadow Link
        // const sourceRect: [number, number, number, number, number, number] = [
        //   node.parent.x,
        //   node.parent.y,
        //   node.parent.data.content_size[0],
        //   node.parent.data.content_size[1],
        //   node.parent.x,
        //   node.parent.y,
        // ];
        // const targetRect: [number, number, number, number, number, number] = [
        //   node.x,
        //   node.y,
        //   node.data.content_size[0],
        //   node.data.content_size[1],
        //   node.x,
        //   node.y,
        // ];
        // const linkPointPair = getLinkPointPairForDirection(
        //   treeState,
        //   sourceRect,
        //   targetRect,
        // );
        // const pathD = getLinkForDirectionV2(treeState)(linkPointPair) || '';
        // drawing.pathGroup
        //   .append('path')
        //   .attr('opacity', 1)
        //   .attr('class', 'shadow-dragging')
        //   .attr('fill', 'none')
        //   .attr('stroke', '#0172DC')
        //   .attr('d', pathD);
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
        if (node.isRoot() || !node.parent) return;
        event.sourceEvent.preventDefault();
        event.sourceEvent.stopPropagation();

        // update shadow node position
        drawing.nodeGroup
          .select('rect.shadow-dragging')
          .attr('x', event.x)
          .attr('y', event.y);

        // // update link position
        // const sourceRect: [number, number, number, number, number, number] = [
        //   node.parent.x,
        //   node.parent.y,
        //   node.parent.data.content_size[0],
        //   node.parent.data.content_size[1],
        //   node.parent.x,
        //   node.parent.y,
        // ];
        // const targetRect: [number, number, number, number, number, number] = [
        //   event.x,
        //   event.y,
        //   node.data.content_size[0],
        //   node.data.content_size[1],
        //   node.x,
        //   node.y,
        // ];
        // const linkPointPair = getLinkPointPairForDirection(
        //   treeState,
        //   sourceRect,
        //   targetRect,
        // );
        // const pathD = getLinkForDirectionV2(treeState)(linkPointPair) || '';
        // drawing.pathGroup
        //   .select<SVGPathElement>('path.shadow-dragging')
        //   .attr('d', pathD);
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

        const shadowNode = drawing.nodeGroup.select('rect.shadow-dragging');
        const shadowLink = drawing.pathGroup.select('path.shadow-dragging');

        // restore link opacity

        const linkLine = drawing.pathGroup
          .selectAll<SVGPathElement, NodeLink<SizedRawNode<D>>>(
            `path.line._${node.data.id}`,
          )
          .style('opacity', (d) =>
            d.target.inCollapsedItem || d.source.inCollapsedItem ? '0' : '1',
          );

        // 1. check if this item should be dropped on another item
        const overNodes = drawing.nodeGroup.selectAll<
          SVGForeignObjectElement,
          NodeInterface<SizedRawNode<D>>
        >(`foreignObject.${draggingItemOverClass}`);
        if (overNodes.data().length) {
          overNodes.classed(draggingItemOverClass, false);
          const from = node;
          // the g tag is the parent of the foreignObject, it has the data of the node
          const to = overNodes.data()[0];
          console.log(from, to);
          if (to.id !== from.parent?.id && !to.hasAncestor(node)) {
            const oldPath = drawing.pathGroup.select<SVGPathElement>(
              `path.line._${node.data.id}._${node.parent?.data.id}`,
            );
            oldPath.attr('class', `line _${node.data.id} _${to.data.id}`);
            if (from.data.id !== to.data.id) {
              treeState.current.moveNodeTo(from.data.id, to.data.id, 0);
              shadowNode.remove();
              shadowLink.remove();
              return;
            }
          }
        }

        // 2. check if this item should change order with its sibling
        const siblings = node.parent?.children || [];
        const curX = event.x;
        const curY = event.y;

        function moveNodeOrderOnXJudge(
          curX: number,
          node: NodeInterface<SizedRawNode<D>>,
          sNode: NodeInterface<SizedRawNode<D>>,
          sNodeNext: NodeInterface<SizedRawNode<D>> | null,
          i: number,
        ) {
          if (node.x > sNode.x && curX < sNode.x) {
            treeState.current.moveNodeTo(
              node.data.id,
              node.parent?.id || '',
              i,
            );
            return true;
          } else if (
            node.x < sNode.x &&
            curX > sNode.x &&
            (!sNodeNext || curX < sNodeNext.x)
          ) {
            treeState.current.moveNodeTo(
              node.data.id,
              node.parent?.id || '',
              i + 1,
            );
            return true;
          }
          return false;
        }
        function moveNodeOrderOnYJudge(
          curY: number,
          node: NodeInterface<SizedRawNode<D>>,
          sNode: NodeInterface<SizedRawNode<D>>,
          sNodeNext: NodeInterface<SizedRawNode<D>> | null,
          i: number,
        ) {
          if (node.y > sNode.y && curY < sNode.y) {
            treeState.current.moveNodeTo(
              node.data.id,
              node.parent?.id || '',
              i,
            );
            return true;
          } else if (
            node.y < sNode.y &&
            curY > sNode.y &&
            (!sNodeNext || curY < sNodeNext.y)
          ) {
            treeState.current.moveNodeTo(
              node.data.id,
              node.parent?.id || '',
              i + 1,
            );
            return true;
          }
          return false;
        }
        if (!node.parent) {
          shadowNode.remove();
          shadowLink.remove();
          return;
        } else if (!node.parent.isRoot()) {
          switch (treeState.current.direction) {
            case 'TB':
            case 'BT':
            case 'V':
              for (let i = 0; i < siblings.length; i++) {
                const sNode = siblings[i];
                const sNodeNext = siblings[i + 1];
                if (sNode.data.id === node.data.id) {
                  continue;
                }
                if (moveNodeOrderOnXJudge(curX, node, sNode, sNodeNext, i)) {
                  shadowNode.remove();
                  shadowLink.remove();
                  return;
                }
              }
              break;

            case 'LR':
            case 'RL':
            case 'H':
              for (let i = 0; i < siblings.length; i++) {
                const sNode = siblings[i];
                const sNodeNext = siblings[i + 1];
                if (sNode.data.id === node.data.id) {
                  continue;
                }
                if (moveNodeOrderOnYJudge(curY, node, sNode, sNodeNext, i)) {
                  shadowNode.remove();
                  shadowLink.remove();
                  return;
                }
              }
              break;
            default:
              break;
          }
        } else if (node.parent.isRoot() && siblings.length > 1) {
          switch (treeState.current.direction) {
            case 'TB':
            case 'BT':
              for (let i = 0; i < siblings.length; i++) {
                const sNode = siblings[i];
                const sNodeNext = siblings[i + 1];
                if (sNode.data.id === node.data.id) {
                  continue;
                }
                if (moveNodeOrderOnXJudge(curX, node, sNode, sNodeNext, i)) {
                  shadowNode.remove();
                  shadowLink.remove();
                  return;
                }
              }
              break;

            case 'LR':
            case 'RL':
              for (let i = 0; i < siblings.length; i++) {
                const sNode = siblings[i];
                const sNodeNext = siblings[i + 1];
                if (sNode.data.id === node.data.id) {
                  continue;
                }
                if (moveNodeOrderOnYJudge(curY, node, sNode, sNodeNext, i)) {
                  shadowNode.remove();
                  shadowLink.remove();
                  return;
                }
              }
              break;
            case 'H': {
              const leftFirstIndex = Math.floor((siblings.length + 1) / 2);
              // right child
              if (node.x > node.parent.x) {
                // dragging in the right side
                if (curX > node.parent.x) {
                  for (let i = 0; i < leftFirstIndex; i++) {
                    const sNode = siblings[i];
                    const sNodeNext =
                      i + 1 >= leftFirstIndex ? null : siblings[i + 1];
                    if (sNode.data.id === node.data.id) {
                      continue;
                    }
                    if (
                      moveNodeOrderOnYJudge(curY, node, sNode, sNodeNext, i)
                    ) {
                      shadowNode.remove();
                      shadowLink.remove();
                      return;
                    }
                  }
                  // dragging in the left side
                } else if (curX < node.parent.x) {
                  for (let i = leftFirstIndex; i < siblings.length; i++) {
                    const sNode = siblings[i];
                    const sNodeNext: NodeInterface<SizedRawNode<D>> | null =
                      siblings[i + 1] || null;
                    if (sNode.data.id === node.data.id) {
                      continue;
                    }
                    if (sNodeNext && curY > sNode.y && curY < sNodeNext.y) {
                      treeState.current.moveNodeTo(
                        node.data.id,
                        node.parent.id,
                        i + 1,
                      );
                      shadowNode.remove();
                      shadowLink.remove();
                      return;
                    }
                  }
                  if (curY < siblings[leftFirstIndex].y) {
                    treeState.current.moveNodeTo(
                      node.data.id,
                      node.parent.id,
                      leftFirstIndex,
                    );
                    shadowNode.remove();
                    shadowLink.remove();
                    return;
                  } else if (curY > siblings[siblings.length - 1].y) {
                    treeState.current.moveNodeTo(
                      node.data.id,
                      node.parent.id,
                      siblings.length,
                    );
                    shadowNode.remove();
                    shadowLink.remove();
                    return;
                  }
                }
                // left child
              } else if (node.x < node.parent.x) {
                // dragging in the left side
                if (curX < node.parent.x) {
                  for (let i = leftFirstIndex; i < siblings.length; i++) {
                    const sNode = siblings[i];
                    const sNodeNext =
                      i + 1 >= leftFirstIndex ? null : siblings[i + 1];
                    if (sNode.data.id === node.data.id) {
                      continue;
                    }
                    if (
                      moveNodeOrderOnYJudge(curY, node, sNode, sNodeNext, i)
                    ) {
                      shadowNode.remove();
                      shadowLink.remove();
                      return;
                    }
                  }
                  // dragging in the right side
                } else if (curX > node.parent.x) {
                  for (let i = 0; i < leftFirstIndex; i++) {
                    const sNode = siblings[i];
                    const sNodeNext: NodeInterface<SizedRawNode<D>> | null =
                      i + 1 === leftFirstIndex ? null : siblings[i + 1];
                    if (sNode.data.id === node.data.id) {
                      continue;
                    }
                    if (sNodeNext && curY > sNode.y && curY < sNodeNext.y) {
                      treeState.current.moveNodeTo(
                        node.data.id,
                        node.parent.id,
                        i + 1,
                      );
                      shadowNode.remove();
                      shadowLink.remove();
                      return;
                    }
                  }
                  if (curY < siblings[0].y) {
                    treeState.current.moveNodeTo(
                      node.data.id,
                      node.parent.id,
                      0,
                    );
                    shadowNode.remove();
                    shadowLink.remove();
                    return;
                  } else if (curY > siblings[leftFirstIndex - 1].y) {
                    treeState.current.moveNodeTo(
                      node.data.id,
                      node.parent.id,
                      leftFirstIndex - 1,
                    );
                    shadowNode.remove();
                    shadowLink.remove();
                    return;
                  }
                }
              }
              break;
            }

            case 'V': {
              const topFirstIndex = Math.floor((siblings.length + 1) / 2);
              // bottom child
              if (node.y > node.parent.y) {
                // dragging in the bottom side
                if (curY > node.parent.y) {
                  for (let i = 0; i < topFirstIndex; i++) {
                    const sNode = siblings[i];
                    const sNodeNext =
                      i + 1 >= topFirstIndex ? null : siblings[i + 1];
                    if (sNode.data.id === node.data.id) {
                      continue;
                    }
                    if (
                      moveNodeOrderOnXJudge(curX, node, sNode, sNodeNext, i)
                    ) {
                      shadowNode.remove();
                      shadowLink.remove();
                      return;
                    }
                  }
                  // dragging in the top side
                } else if (curY < node.parent.y) {
                  for (let i = topFirstIndex; i < siblings.length; i++) {
                    const sNode = siblings[i];
                    const sNodeNext: NodeInterface<SizedRawNode<D>> | null =
                      siblings[i + 1] || null;
                    if (sNode.data.id === node.data.id) {
                      continue;
                    }
                    if (sNodeNext && curX > sNode.x && curX < sNodeNext.x) {
                      treeState.current.moveNodeTo(
                        node.data.id,
                        node.parent.id,
                        i + 1,
                      );
                      shadowNode.remove();
                      shadowLink.remove();
                      return;
                    }
                  }
                  if (curX < siblings[topFirstIndex].x) {
                    treeState.current.moveNodeTo(
                      node.data.id,
                      node.parent.id,
                      topFirstIndex,
                    );
                    shadowNode.remove();
                    shadowLink.remove();
                    return;
                  } else if (curX > siblings[siblings.length - 1].x) {
                    treeState.current.moveNodeTo(
                      node.data.id,
                      node.parent.id,
                      siblings.length,
                    );
                    shadowNode.remove();
                    shadowLink.remove();
                    return;
                  }
                }
                // top child
              } else if (node.y < node.parent.y) {
                // dragging in the top side
                if (curY < node.parent.y) {
                  for (let i = topFirstIndex; i < siblings.length; i++) {
                    const sNode = siblings[i];
                    const sNodeNext =
                      i + 1 >= topFirstIndex ? null : siblings[i + 1];
                    if (sNode.data.id === node.data.id) {
                      continue;
                    }
                    if (
                      moveNodeOrderOnXJudge(curX, node, sNode, sNodeNext, i)
                    ) {
                      shadowNode.remove();
                      shadowLink.remove();
                      return;
                    }
                  }
                  // dragging in the bottom side
                } else if (curY > node.parent.y) {
                  for (let i = 0; i < topFirstIndex; i++) {
                    const sNode = siblings[i];
                    const sNodeNext: NodeInterface<SizedRawNode<D>> | null =
                      i + 1 === topFirstIndex ? null : siblings[i + 1];
                    if (sNode.data.id === node.data.id) {
                      continue;
                    }
                    if (sNodeNext && curX > sNode.x && curX < sNodeNext.x) {
                      treeState.current.moveNodeTo(
                        node.data.id,
                        node.parent.id,
                        i + 1,
                      );
                      shadowNode.remove();
                      shadowLink.remove();
                      return;
                    }
                  }
                  if (curX < siblings[0].x) {
                    treeState.current.moveNodeTo(
                      node.data.id,
                      node.parent.id,
                      0,
                    );
                    shadowNode.remove();
                    shadowLink.remove();
                    return;
                  } else if (curX > siblings[topFirstIndex - 1].x) {
                    treeState.current.moveNodeTo(
                      node.data.id,
                      node.parent.id,
                      topFirstIndex - 1,
                    );
                    shadowNode.remove();
                    shadowLink.remove();
                    return;
                  }
                }
              }
              break;
            }

            default:
              break;
          }
        }

        // 3. animate to the original position

        const dragTran = transition().duration(300);

        // animate drag btn and nodes to original position

        shadowNode

          .transition(dragTran as any)
          .attr('opacity', 0)
          .attr('x', node.x)
          .attr('y', node.y)
          .remove();

        const sourceRect: [number, number, number, number, number, number] = [
          node.parent.x,
          node.parent.y,
          node.parent.data.content_size[0],
          node.parent.data.content_size[1],
          node.parent.x,
          node.parent.y,
        ];
        const targetRect: [number, number, number, number, number, number] = [
          node.x,
          node.y,
          node.data.content_size[0],
          node.data.content_size[1],
          node.x,
          node.y,
        ];
        const linkPointPair = getLinkPointPairForDirection(
          treeState,
          sourceRect,
          targetRect,
        );
        const pathD = getLinkForDirectionV2(treeState)(linkPointPair) || '';
        shadowLink

          .transition(dragTran as any)
          .attr('opacity', 0)
          .attr('d', pathD)
          .remove();
      },
    );
}
