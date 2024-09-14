import { css } from '@base/styled';
import { memo, useEffect, useRef } from 'react';
import { Payload } from './render/model/interface';

const SNodeItem = css`
  outline: 1px solid #1890ff;
  background-color: #f0f0f0;
  border-radius: 5px;
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
`;

export const editingNodePreId = 'editing-node-pre';

export const NodeContent = memo<{
  id: string;
  data: Payload;
  editAble?: boolean;
  idPrefix?: string;
  minWidth?: number;
  minHeight?: number;
  onBlur?: () => void;
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
        {editAble ? (
          <pre
            ref={ref}
            id={editingNodePreId}
            data-id={id}
            className={SNodeContentText}
            contentEditable={true}
            onBlurCapture={(e) => {
              props.onBlur && props.onBlur();
            }}
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
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === 'collapsed') {
      continue;
    }
    if (prev[keys[i]] !== next[keys[i]]) {
      return false;
    }
  }
  return true;
}
