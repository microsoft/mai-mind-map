import { css } from '@base/styled';
import { FC, Fragment, useEffect, useState } from 'react';
import { NodeContent, editingNodePreId } from './NodeContent';
import { NodeInterface } from './render/layout';
import { Payload } from './render/model/interface';
import { SizedRawNode } from './render/node/interface';

export interface EditingNodeType<D> {
  node: NodeInterface<SizedRawNode<D>>;
  translate: [number, number];
}

export const EditingNode: FC<{
  node: EditingNodeType<Payload> | null;
  modifyNode: (nodeId: string, content: string) => void;
  setEditingNode: (node: EditingNodeType<Payload> | null) => void;
}> = (props) => {
  const { node: pendingNode, modifyNode } = props;

  const [editingNode, setEditingNode] =
    useState<EditingNodeType<Payload> | null>(null);

  useEffect(() => {
    // get current editing content and submit change
    const perEl = document.getElementById(editingNodePreId);
    if (perEl) {
      const content = perEl.innerText || '';
      const id = perEl.dataset.id || '';
      if (id) {
        props.modifyNode(id, content);
      }
    }

    // then set editing node
    setEditingNode(pendingNode);
  }, [pendingNode, modifyNode]);

  // const { node: editingNode } = props;
  if (!editingNode) return null;
  const { node, translate } = editingNode;
  const { id, data, x, y } = node;
  const [tx, ty] = translate;
  return (
    <div
      style={{
        position: 'absolute',
        width: 'fit-content',
        left: x + tx,
        top: y + ty,
        zIndex: 1000,
        boxShadow: '0 0 10px 0 #1890ff',
      }}
    >
      <NodeContent
        id={id}
        data={data.payload}
        editAble={true}
        idPrefix="enc"
        minWidth={node.data.content_size[0]}
        minHeight={node.data.content_size[1]}
        onBlur={() => {
          // console.log('onBlur');
          // props.setEditingNode(null);
        }}
      />
    </div>
  );
};
