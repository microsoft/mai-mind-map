import { css } from '@base/styled';
import { memo, useEffect, useRef } from 'react';
import { Ellipsis } from '../icons/icons';
import { Payload } from './render/model/interface';

const SNodeItem = css`
  outline: 1px solid #1890ff;
  background-color: #fff;
  border-radius: 5px;
  position: relative;
`;

const SNodeContentText = css`
  display: block;
  display: block;
  width: fit-content;
  max-width: 500px;
  box-sizing: border-box;
  margin: 0;
  padding: 10px;
  word-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;
  border-radius: 5px;
  outline: none !important;
  line-height: 1.4;
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
  background-color: #6298ca;
  color: white;
  transition-duration: 0.2s;
  &:hover {
    box-shadow: 0 0 0px 3px #a9d4fd;
  }
`;

export const editingNodePreId = 'editing-node-pre';

export const NodeContent = memo<{
  id: string;
  data: Payload;
  editAble?: boolean;
  idPrefix?: string;
  minWidth?: number;
  minHeight?: number;
  onToggleCollapse?: (nodeId: string) => void;
  onBlur?: () => void;
  onEditorKeyDown?: (e: React.KeyboardEvent<HTMLPreElement>) => void;
}>(
  (props) => {
    const {
      id,
      data,
      editAble = false,
      minWidth,
      minHeight,
      idPrefix = 'nc',
    } = props;
    const { content } = data;
    const ref = useRef<HTMLPreElement>(null);
    useEffect(() => {
      if (!ref.current) return;
      ref.current.textContent = content;
      ref.current.focus();
    }, [content]);
    return (
      <div className={SNodeItem} style={{ minWidth, minHeight }}>
        {data.collapsed && !editAble && (
          <button
            title="Expand"
            className={SExpandChar}
            onClick={() => {
              props.onToggleCollapse && props.onToggleCollapse(id);
            }}
          >
            <Ellipsis />
          </button>
        )}
        {editAble ? (
          <pre
            ref={ref}
            id={editingNodePreId}
            data-id={id}
            className={SNodeContentText}
            contentEditable={true}
            onBlur={(e) => {
              props.onBlur && props.onBlur();
            }}
            onKeyDown={props.onEditorKeyDown}
          ></pre>
        ) : (
          <pre id={`${idPrefix}-${id}`} className={SNodeContentText}>
            {content}
          </pre>
        )}
      </div>
    );
  },
  (prev, next) => {
    const { id, data, editAble, idPrefix } = prev;
    const {
      id: nextId,
      data: nextData,
      editAble: nextEditAble,
      idPrefix: nextIdPrefix,
    } = next;

    const equal =
      id === nextId &&
      isEqual(data, nextData) &&
      editAble === nextEditAble &&
      idPrefix === nextIdPrefix;
    return equal;
  },
);

function isEqual(prev: Payload, next: Payload) {
  const keys: (keyof Payload)[] = Object.keys(prev);
  const nextKeys: (keyof Payload)[] = Object.keys(next);
  if (keys.length !== nextKeys.length) {
    return false;
  }
  for (let i = 0; i < keys.length; i++) {
    if (prev[keys[i]] !== next[keys[i]]) {
      return false;
    }
  }
  return true;
}
