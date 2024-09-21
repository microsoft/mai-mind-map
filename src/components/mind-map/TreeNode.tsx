import { css } from '@base/styled';
import { FC, Fragment, useEffect, useMemo, useState } from 'react';
import { Ellipsis } from '../icons/icons';
import { NodeContent } from './NodeContent';

import { NodeInterface } from './render/layout';
import { Payload } from './render/model/interface';
import { SizedRawNode } from './render/node/interface';

const STreeNodeBox1 = css`
  position: relative;
  width: fit-content;
  border-radius: 5px;
`;

const SExpandChar = css`
  position: absolute;
  top: 0;
  right: -20px;
  width: 16px;
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
  &:hover {
    box-shadow: 0 0 0px 3px #a9d4fd;
  }
`;

export const TreeNode: FC<{
  node: NodeInterface<SizedRawNode<Payload>>;
  toggleCollapseNode(nodeId: string): void;
}> = (props) => {
  const { node, toggleCollapseNode } = props;
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
    <div className={STreeNodeBox1} style={{ backgroundColor: bgColor }}>
      {data.payload.collapsed && (
        <button
          title="Expand"
          className={SExpandChar}
          onClick={() => {
            toggleCollapseNode(id);
          }}
        >
          <Ellipsis />
        </button>
      )}
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
  );
};
