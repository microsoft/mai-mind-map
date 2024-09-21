import { css } from '@base/styled';
import { FC, Fragment, useEffect, useMemo, useState } from 'react';
import { Ellipsis, Fold } from '../icons/icons';
import { NodeContent } from './NodeContent';
import { Direction } from './render';

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
    outline: 2px solid #1890ff;
    & > .fold {
      display: flex;
    }
  }
`;
const SFold = css`
  display: none;
  position: absolute;
  margin: 0;
  padding: 0;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font-size: 10px;
  border-radius: 10px;
  border: 0;
  background-color: #1890ff;
  color: white;
  transition-duration: 0.2s;
  width: 16px;
  height: 16px;
  transform-origin: center;
  &:hover {
    box-shadow: 0 0 0px 3px #a9d4fd;
  }
`;

const SExpandChar = css`
  position: absolute;
  height: 16px;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font-size: 10px;
  border-radius: 10px;
  border: 0;
  background-color: #1890ff;
  color: white;
  transition-duration: 0.2s;
  width: fit-content;
  padding: 0 5px;
  line-height: 16;
  &:hover {
    box-shadow: 0 0 0px 3px #a9d4fd;
  }
`;

export const TreeNode: FC<{
  node: NodeInterface<SizedRawNode<Payload>>;
  toggleCollapseNode(nodeId: string): void;
  treeDirection: Direction;
}> = (props) => {
  const { node, toggleCollapseNode, treeDirection } = props;
  const { id, data } = node;
  const [width, height] = data.content_size;

  const { bgColor, textColor } = useMemo(() => {
    if (node.depth === 0) {
      return {
        bgColor: '#1890ff',
        textColor: '#fff',
      };
    } else if (node.depth === 1) {
      return {
        bgColor: '#f0f0f0',
        textColor: '#000',
      };
    } else {
      return {
        bgColor: '#fff',
        textColor: '#000',
      };
    }
  }, [node]);

  return (
    <Fragment>
      <div className={`drag-btn ${SDragBtn}`}>
        <FoldIndicator
          node={node}
          toggleCollapseNode={toggleCollapseNode}
          treeDirection={treeDirection}
        />
      </div>
      <div className={STreeNodeBox1} style={{ backgroundColor: bgColor }}>
        <NodeContent
          style={{
            width,
            height,
            minWidth: width,
            minHeight: height,
            color: textColor,
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

  const posStyleF = useMemo(() => {
    switch (treeDirection) {
      case 'TB':
        return {
          top: '100%',
          transform: 'translateX(-50%) rotate(180deg)',
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
          transform: 'translateY(-50%) rotate(90deg)',
          left: '100%',
        };
      case 'RL':
        return {
          top: '50%',
          transform: 'translateY(-50%) rotate(-90deg)',
          right: '0',
        };
      case 'H':
        if (node.x > (node.parent?.x ?? 0)) {
          return {
            top: '50%',
            transform: 'translateY(-50%) rotate(90deg)',
            left: '100%',
          };
        } else {
          return {
            top: '50%',
            transform: 'translateY(-50%) rotate(-90deg)',
            right: '100%',
          };
        }
      case 'V':
        if (node.y > (node.parent?.y ?? 0)) {
          return {
            top: '100%',
            transform: 'translateX(-50%) rotate(180deg)',
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

  if (!node.data.children?.length) return null;
  return data.payload.collapsed ? (
    <button
      style={posStyleE}
      title="Expand"
      className={SExpandChar}
      onClick={() => {
        toggleCollapseNode(id);
      }}
    >
      {node.data.children?.length ?? <Ellipsis />}
    </button>
  ) : (
    <button
      style={posStyleF}
      className={`fold ${SFold}`}
      onClick={() => {
        toggleCollapseNode(id);
      }}
    >
      <Fold />
    </button>
  );
}
