import { css } from '@base/styled';
import { HSLColor, hsl } from 'd3-color';
import { FC, Fragment, useEffect, useMemo, useState } from 'react';
import { Ellipsis, Fold } from '../icons/icons';
import { NodeContent } from './NodeContent';
import { Direction } from './render';
import { ColorMode } from './render/hooks/constants';

import { useNodeColor } from './render/hooks/useNodeColor';
import { NodeInterface } from './render/layout';
import { Payload } from './render/model/interface';
import { SizedRawNode } from './render/node/interface';

const STreeNodeBox1 = css`
  position: relative;
  width: fit-content;
  border-radius: 5px;
`;
const SDragBtn = css`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  border-radius: 5px;
  &:hover {
    outline: 2px solid #0172dc;
    & .fold {
      display: flex;
    }
  }
`;
const SBtnBox = css`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
`;
const SFold = css`
  display: none;
  margin: 0;
  padding: 0;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font-size: 10px;
  border-radius: 10px;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition-duration: 0.2s;
  width: 18px;
  height: 18px;
  transform-origin: center;
  border: 1px solid #0172dc;
  cursor: pointer;
  &:hover {
    box-shadow: 0 0 0px 3px #a9d4fd;
  }
`;

const SExpandChar = css`
  cursor: pointer;
  height: 18px;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font-size: 12px;
  border-radius: 10px;
  border: 1px solid #0172dc;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition-duration: 0.2s;
  width: fit-content;
  padding: 0 5px;
  line-height: 18px;
  &:hover {
    box-shadow: 0 0 0px 3px #a9d4fd;
  }
`;

export const TreeNode: FC<{
  node: NodeInterface<SizedRawNode<Payload>>;
  colorMode: ColorMode;
  toggleCollapseNode(nodeId: string): void;
  treeDirection: Direction;
}> = (props) => {
  const { node, toggleCollapseNode, treeDirection, colorMode } = props;
  const { id, data } = node;
  const [width, height] = data.content_size;
  const { cssVarStyle } = useNodeColor(node, colorMode);

  return (
    <Fragment>
      <div className={`drag-btn ${SDragBtn}`} style={cssVarStyle}>
        <FoldIndicator
          node={node}
          toggleCollapseNode={toggleCollapseNode}
          treeDirection={treeDirection}
        />
      </div>
      <div className={STreeNodeBox1} style={cssVarStyle}>
        <NodeContent
          isRoot={node.isRoot()}
          style={{
            width,
            height,
            minWidth: width,
            minHeight: height,
          }}
          id={id}
          data={data.payload}
          idPrefix="enc"
        />
      </div>
    </Fragment>
  );
};

function FoldIndicator(props: {
  node: NodeInterface<SizedRawNode<Payload>>;
  toggleCollapseNode(nodeId: string): void;
  treeDirection: Direction;
}) {
  const { node, toggleCollapseNode, treeDirection } = props;
  const { id, data } = node;
  if (node.isRoot()) {
    return null;
  }

  const posStyleE = useMemo(() => {
    switch (treeDirection) {
      case 'TB':
        return {
          top: '100%',
          transform: 'translateX(-50%)',
          left: '50%',
        };
      case 'BT':
        return {
          bottom: '100%',
          transform: 'translateX(-50%)',
          left: '50%',
        };
      case 'LR':
        return {
          top: '50%',
          transform: 'translateY(-50%)',
          left: '100%',
        };
      case 'RL':
        return {
          top: '50%',
          transform: 'translateY(-50%)',
          right: '100%',
        };
      case 'H':
        if (node.x > (node.parent?.x ?? 0)) {
          return {
            top: '50%',
            transform: 'translateY(-50%)',
            left: '100%',
          };
        } else {
          return {
            top: '50%',
            transform: 'translateY(-50%)',
            right: '100%',
          };
        }
      case 'V':
        if (node.y > (node.parent?.y ?? 0)) {
          return {
            top: '100%',
            transform: 'translateX(-50%)',
            left: '50%',
          };
        } else {
          return {
            bottom: '100%',
            transform: 'translateX(-50%)',
            left: '50%',
          };
        }
      default:
        return {
          top: '50%',
          transform: 'translateY(-50%)',
          left: '100%',
        };
    }
  }, [node, treeDirection]);

  const posStyleFPos = useMemo(() => {
    switch (treeDirection) {
      case 'TB':
        return {
          top: '100%',
          width: '100%',
        };
      case 'BT':
        return {
          bottom: '100%',
          width: '100%',
        };
      case 'LR':
        return {
          height: '100%',
          left: '100%',
        };
      case 'RL':
        return {
          height: '100%',
          right: '100%',
        };
      case 'H':
        if (node.x > (node.parent?.x ?? 0)) {
          return {
            height: '100%',
            left: '100%',
          };
        } else {
          return {
            height: '100%',
            right: '100%',
          };
        }
      case 'V':
        if (node.y > (node.parent?.y ?? 0)) {
          return {
            top: '100%',
            width: '100%',
          };
        } else {
          return {
            bottom: '100%',
            width: '100%',
          };
        }
      default:
        return {
          height: '100%',
          left: '100%',
        };
    }
  }, [node, treeDirection]);

  const posStyleFScale = useMemo(() => {
    switch (treeDirection) {
      case 'TB':
        return {
          transform: 'rotate(180deg)',
        };
      case 'BT':
        return {
          transform: 'rotate(0deg)',
        };
      case 'LR':
        return {
          transform: ' rotate(90deg)',
        };
      case 'RL':
        return {
          transform: ' rotate(-90deg)',
        };
      case 'H':
        if (node.x > (node.parent?.x ?? 0)) {
          return {
            transform: ' rotate(90deg)',
          };
        } else {
          return {
            transform: ' rotate(-90deg)',
          };
        }
      case 'V':
        if (node.y > (node.parent?.y ?? 0)) {
          return {
            transform: 'rotate(180deg)',
          };
        } else {
          return {
            transform: 'rotate(0deg)',
          };
        }
      default:
        return {
          transform: 'rotate(90deg)',
        };
    }
  }, [node, treeDirection]);

  if (!node.data.children?.length) return null;
  return data.payload.collapsed ? (
    <div className={SBtnBox} style={posStyleE}>
      <div
        role="button"
        title="Expand"
        className={SExpandChar}
        onClick={() => {
          toggleCollapseNode(id);
        }}
      >
        {node.data.children?.length ?? <Ellipsis />}
      </div>
    </div>
  ) : (
    <div className={SBtnBox} style={posStyleFPos}>
      <button
        className={`fold ${SFold}`}
        title="Collapse"
        style={posStyleFScale}
        onClick={() => {
          toggleCollapseNode(id);
        }}
      >
        <Fold />
      </button>
    </div>
  );
}
