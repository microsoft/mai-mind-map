import { path } from 'd3-path';
import { DefaultLinkObject, linkHorizontal, linkVertical } from 'd3-shape';
import { MutableRefObject } from 'react';
import { LinkMode } from '../hooks/constants';
import { type TreeState } from '../hooks/constants';
import { NodeLink } from '../layout/interface';
import { SizedRawNode } from '../node/interface';

export function getCurveLinkForDirection<D>(
  treeState: MutableRefObject<TreeState<D>>,
) {
  switch (treeState.current.direction) {
    case 'LR':
    case 'RL':
    case 'H':
      return linkHorizontal();
    case 'TB':
    case 'BT':
    case 'V':
      return linkVertical();
    default:
      return linkVertical();
  }
}

const firstMoveVal = 20;
const cornerVal = 10;

export function getLinkFun<D>(
  treeState: MutableRefObject<TreeState<D>>,
  link: NodeLink<SizedRawNode<D>>,
) {
  switch (treeState.current.linkMode) {
    case LinkMode.CURVE:
      return getCurveLinkForDirection(treeState);
    case LinkMode.LINE:
      return linkRoundedCorners;
    case LinkMode.HYBRID: {
      if (link.source.isRoot()) {
        return bezierCurve;
      } else {
        return linkRoundedCorners;
      }
    }
  }

  function bezierCurve(link: DefaultLinkObject) {
    const { source, target } = link;
    const [sx, sy] = source;
    const [tx, ty] = target;
    const pathData = path();
    pathData.moveTo(sx, sy);
    switch (treeState.current.direction) {
      case 'LR':
      case 'RL':
      case 'H':
        pathData.quadraticCurveTo(sx, ty, tx, ty);
        break;
      case 'BT':
      case 'TB':
      case 'V':
        pathData.quadraticCurveTo(tx, sy, tx, ty);
        break;
    }

    return pathData.toString();
  }

  function linkRoundedCorners(link: DefaultLinkObject) {
    const [sx, sy] = link.source;
    const [tx, ty] = link.target;
    const pathData = path();
    pathData.moveTo(sx, sy);

    switch (treeState.current.direction) {
      case 'LR': {
        const corner = Math.min(cornerVal, Math.abs(ty - sy));
        pathData.lineTo(sx + firstMoveVal, sy);
        pathData.lineTo(sx + firstMoveVal, ty + (ty > sy ? -corner : corner));
        pathData.quadraticCurveTo(
          sx + firstMoveVal,
          ty,
          sx + firstMoveVal + cornerVal,
          ty,
        );
        pathData.lineTo(tx, ty);

        break;
      }

      case 'RL': {
        const corner = Math.min(cornerVal, Math.abs(ty - sy));
        pathData.lineTo(sx - firstMoveVal, sy);
        pathData.lineTo(sx - firstMoveVal, ty + (ty > sy ? -corner : corner));
        pathData.quadraticCurveTo(
          sx - firstMoveVal,
          ty,
          sx - firstMoveVal - cornerVal,
          ty,
        );
        pathData.lineTo(tx, ty);

        break;
      }
      case 'TB': {
        const corner = Math.min(cornerVal, Math.abs(tx - sx));
        pathData.lineTo(sx, sy + firstMoveVal);
        pathData.lineTo(tx + (tx > sx ? -corner : corner), sy + firstMoveVal);
        pathData.quadraticCurveTo(
          tx,
          sy + firstMoveVal,
          tx,
          sy + firstMoveVal + cornerVal,
        );
        pathData.lineTo(tx, ty);
        break;
      }

      case 'BT': {
        const corner = Math.min(cornerVal, Math.abs(tx - sx));
        pathData.lineTo(sx, sy - firstMoveVal);
        pathData.lineTo(tx + (tx > sx ? -corner : corner), sy - firstMoveVal);
        pathData.quadraticCurveTo(
          tx,
          sy - firstMoveVal,
          tx,
          sy - firstMoveVal - cornerVal,
        );
        pathData.lineTo(tx, ty);
        break;
      }

      case 'H': {
        if (sx < tx) {
          const corner = Math.min(cornerVal, Math.abs(ty - sy));
          pathData.lineTo(sx + firstMoveVal, sy);
          pathData.lineTo(sx + firstMoveVal, ty + (ty > sy ? -corner : corner));
          pathData.quadraticCurveTo(
            sx + firstMoveVal,
            ty,
            sx + firstMoveVal + cornerVal,
            ty,
          );
          pathData.lineTo(tx, ty);
        } else {
          const corner = Math.min(cornerVal, Math.abs(ty - sy));
          pathData.lineTo(sx - firstMoveVal, sy);
          pathData.lineTo(sx - firstMoveVal, ty + (ty > sy ? -corner : corner));
          pathData.quadraticCurveTo(
            sx - firstMoveVal,
            ty,
            sx - firstMoveVal - cornerVal,
            ty,
          );
          pathData.lineTo(tx, ty);
        }
        break;
      }

      case 'V':
        if (sy < ty) {
          const corner = Math.min(cornerVal, Math.abs(tx - sx));
          pathData.lineTo(sx, sy + firstMoveVal);
          pathData.lineTo(tx + (tx > sx ? -corner : corner), sy + firstMoveVal);
          pathData.quadraticCurveTo(
            tx,
            sy + firstMoveVal,
            tx,
            sy + firstMoveVal + cornerVal,
          );
          pathData.lineTo(tx, ty);
        } else {
          const corner = Math.min(cornerVal, Math.abs(tx - sx));
          pathData.lineTo(sx, sy - firstMoveVal);
          pathData.lineTo(tx + (tx > sx ? -corner : corner), sy - firstMoveVal);
          pathData.quadraticCurveTo(
            tx,
            sy - firstMoveVal,
            tx,
            sy - firstMoveVal - cornerVal,
          );
          pathData.lineTo(tx, ty);
        }
        break;

      default:
        break;
    }

    return pathData.toString();
  }
}
