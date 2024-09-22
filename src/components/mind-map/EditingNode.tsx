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
  addNode(parentId: string, index: number, content: string): void;
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

  const [pos, setPos] = useState<[number, number]>([
    editingNode?.node?.x || 0,
    editingNode?.node?.y || 0,
  ]);

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
    if (pendingNode) {
      setPos([pendingNode.node.x, pendingNode.node.y]);
    }
  }, [pendingNode, modifyNode]);

  useEffect(() => {
    if (editingNode) {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      window.addEventListener(
        `update-pos-${editingNode.node.data.id}`,
        (e) => {
          setPos((e as CustomEvent<[number, number]>).detail);
        },
        { signal: controller1.signal },
      );

      window.addEventListener(
        `update-data-${editingNode.node.data.id}`,
        (e) => {
          const node = (e as CustomEvent<NodeInterface<SizedRawNode<Payload>>>)
            .detail;
          setEditingNode({ node, translate: editingNode!.translate });
        },
        { signal: controller2.signal },
      );
      return () => {
        controller1.abort();
        controller2.abort();
      };
    }
  }, [editingNode]);

  // const { node: editingNode } = props;
  if (!editingNode) return null;
  const { node, translate } = editingNode;
  const { id, data } = node;
  const [tx, ty] = translate;
  const x = pos[0] || node.x;
  const y = pos[1] || node.y;
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
        borderRadius: 5,
        outline: '2px solid #0172DC',
      }}
    >
      <div className={SToolbar}>
        {data.children?.length ? (
          <button
            onClick={() => {
              toggleCollapseNode(id);
            }}
            title={data.payload.collapsed ? 'Expand' : 'Collapse'}
          >
            {data.payload.collapsed ? <Expand /> : <Collapse />}
          </button>
        ) : null}

        <button
          onClick={() => {
            addNode(id, data.children?.length ?? 0, ' ');
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
        isRoot={node.isRoot()}
        editAble={true}
        idPrefix="enc"
        style={{
          backgroundColor: '#fff',
          minWidth: data.content_size[0],
          minHeight: data.content_size[1],
        }}
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
