import { css } from '@base/styled';
import { FC, Fragment, useEffect, useState } from 'react';
import { AddChild, Collapse, Color, Delete, Expand } from '../icons/icons';
import { NodeContent, editingNodePreId } from './NodeContent';
import { ColorMode } from './render/hooks/constants';
import { supportColors } from './render/hooks/useAutoColoringMindMap';
import { useNodeColor } from './render/hooks/useNodeColor';
import { EditingNodePos } from './render/hooks/useRenderWithD3';
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
const SColorBox = css`
  position: absolute;
  bottom: calc(100% + 5px);
  left: 0px;
  width: 278px;
  display: flex;
  flex-wrap: wrap;
  z-index: 1;
  padding: 10px;
  border: 1px solid #999;
  background: #fff;
  border-radius: 6px;
  box-shadow: rgba(0, 0, 0, 0.3) 0px 0px 5px 0px;
  gap: 3px;
`;
const SColorBtn = css`
  width: 40px;
  height: 25px;
  border: 0;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

export const EditingNode: FC<{
  scale: number;
  node: EditingNodeType<Payload> | null;
  colorMode: ColorMode;
  modifyNode: (nodeId: string, content: string) => void;
  modifyNodePayload: (nodeId: string, payload: Payload) => void;
  setPendingEditNode: (node: EditingNodeType<Payload> | null) => void;
  toggleCollapseNode(nodeId: string): void;
  addNode(parentId: string, index: number, content: string): void;
  delNode(id: string): void;
}> = (props) => {
  const {
    scale,
    node: pendingNode,
    colorMode,
    modifyNode,
    modifyNodePayload,
    toggleCollapseNode,
    setPendingEditNode,
    addNode,
    delNode,
  } = props;
  const [showColorBox, setShowColorBox] = useState(false);

  const [editingNode, setEditingNode] =
    useState<EditingNodeType<Payload> | null>(null);

  const [pos, setPos] = useState<{
    pos: [number, number];
    trans?: [number, number];
  }>({ pos: [editingNode?.node?.x || 0, editingNode?.node?.y || 0] });

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
      setPos({ pos: [pendingNode.node.x, pendingNode.node.y] });
    }
  }, [pendingNode, modifyNode]);

  useEffect(() => {
    if (editingNode) {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      window.addEventListener(
        `update-pos-${editingNode.node.data.id}`,
        (e) => {
          setPos((oldVal) => {
            const newVal = Object.assign(
              {},
              oldVal,
              (e as CustomEvent<EditingNodePos>).detail,
            );
            return newVal;
          });
        },
        { signal: controller1.signal },
      );
      window.addEventListener(
        'update-pos-all',
        (e) => {
          setPos((oldVal) => {
            const newVal = Object.assign(
              {},
              oldVal,
              (e as CustomEvent<EditingNodePos>).detail,
            );
            return newVal;
          });
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

  const { cssVarStyle } = useNodeColor(
    editingNode?.node ?? null,
    props.colorMode,
  );

  useEffect(() => {
    if (!editingNode) {
      setShowColorBox(false);
    }
  }, [editingNode]);

  // const { node: editingNode } = props;
  if (!editingNode) return null;
  const { node, translate } = editingNode;
  const { id, data } = node;
  const [tx, ty] = pos.trans ? pos.trans : translate;
  const x = pos.pos[0] || node.x;
  const y = pos.pos[1] || node.y;
  return (
    <div
      style={Object.assign({}, cssVarStyle, {
        transformOrigin: '0 0',
        position: 'absolute',
        width: 'fit-content',
        left: x * scale + tx,
        top: y * scale + ty,
        transform: `scale(${scale})`,
        zIndex: 1000,
        borderRadius: 5,
        outline: '2px solid #0172DC',
      })}
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
        {node.depth === 1 && colorMode === ColorMode.COLORFUL && (
          <button
            onClick={() => {
              setShowColorBox(!showColorBox);
            }}
            title="Change color"
          >
            <Color />
          </button>
        )}
        <div
          className={SColorBox}
          style={{ display: showColorBox ? '' : 'none' }}
        >
          {supportColors.map((color) => {
            return (
              <button
                key={color}
                className={SColorBtn}
                title={color}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setShowColorBox(false);
                  modifyNodePayload(
                    id,
                    Object.assign({}, data.payload, { hilight: color }),
                  );
                }}
              ></button>
            );
          })}
        </div>
      </div>
      <NodeContent
        id={id}
        data={data.payload}
        isRoot={node.isRoot()}
        editAble={true}
        idPrefix="enc"
        style={{
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
