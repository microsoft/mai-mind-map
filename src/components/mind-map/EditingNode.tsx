import { css } from '@base/styled';
import { FC, Fragment, useEffect, useState } from 'react';
import { AddChild, Collapse, Delete, Expand } from '../icons/icons';
import { NodeContent, editingNodePreId } from './NodeContent';
import { NodeInterface } from './render/layout';
import { Payload } from './render/model/interface';
import { SizedRawNode } from './render/node/interface';

export interface EditingNodeType<D> {
  node: NodeInterface<SizedRawNode<D>>;
  translate: [number, number];
}
const SToolbar = css`
  position: absolute;
  top: -30px;
  left: 0;
  display: flex;
`;

export const EditingNode: FC<{
  scale: number;
  node: EditingNodeType<Payload> | null;
  modifyNode: (nodeId: string, content: string) => void;
  setPendingEditNode: (node: EditingNodeType<Payload> | null) => void;
  toggleCollapseNode(nodeId: string): void;
  addNode(parentId: string, content: string): void;
  delNode(id: string): void;
}> = (props) => {
  const {
    scale,
    node: pendingNode,
    modifyNode,
    toggleCollapseNode,
    setPendingEditNode,
    addNode,
    delNode,
  } = props;

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
        transformOrigin: '0 0',
        position: 'absolute',
        width: 'fit-content',
        left: x * scale + tx,
        top: y * scale + ty,
        transform: `scale(${scale})`,
        zIndex: 1000,
        boxShadow: '0 0 10px 0 #1890ff',
      }}
    >
      <div className={SToolbar}>
        {data.children?.length && (
          <button
            onClick={() => {
              toggleCollapseNode(id);
              setEditingNode(null);
            }}
            title={data.payload.collapsed ? 'Expand' : 'Collapse'}
          >
            {data.payload.collapsed ? <Expand /> : <Collapse />}
          </button>
        )}

        <button
          onClick={() => {
            addNode(id, ' ');
            setEditingNode(null);
          }}
          title="Add Child"
        >
          <AddChild />
        </button>
        {node.parent && (
          <button
            onClick={() => {
              delNode(id);
              setEditingNode(null);
            }}
            title="Delete"
          >
            <Delete />
          </button>
        )}
      </div>
      <NodeContent
        id={id}
        data={data.payload}
        editAble={true}
        idPrefix="enc"
        minWidth={node.data.content_size[0]}
        minHeight={node.data.content_size[1]}
        onEditorKeyDown={(e) => {
          if (e.key === 'Escape') {
            setPendingEditNode(null);
          }
        }}
        onBlur={() => {
          // console.log('onBlur');
          // props.setEditingNode(null);
        }}
      />
    </div>
  );
};
