import { css } from '@base/styled';
import { memo, useEffect, useMemo, useRef } from 'react';
import { markdown } from './render/helpers/markdown';
import { Payload } from './render/model/interface';

const SNodeItem = css`
  background-color: var(--bg-color);
  border-radius: 5px;
  position: relative;
  transition: background-color 0.2s;
  font-size: 16px;
`;

const SNodeContentText = css`
  display: block;
  color: var(--text-color);
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
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  & * {
    margin: 0;
    padding: 0;
  }
`;

export const editingNodePreId = 'editing-node-pre';

export const NodeContent = memo<{
  id: string;
  data: Payload;
  isRoot: boolean;
  style?: React.CSSProperties;
  editAble?: boolean;
  idPrefix?: string;
  onToggleCollapse?: (nodeId: string) => void;
  onBlur?: () => void;
  onEditorKeyDown?: (e: React.KeyboardEvent<HTMLPreElement>) => void;
}>(
  (props) => {
    const {
      id,
      data,
      style,
      editAble = false,
      idPrefix = 'nc',
      isRoot,
    } = props;
    const { content } = data;
    const contentHTML = useMemo(() => markdown.makeHtml(content), [content]);
    const ref = useRef<HTMLPreElement>(null);
    useEffect(() => {
      if (!ref.current) return;
      ref.current.textContent = content;
      ref.current.focus();
    }, [content]);
    return (
      <div className={SNodeItem} style={{ ...(style || {}) }}>
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
            style={
              isRoot
                ? { fontSize: '1.5em', lineHeight: 1.5 }
                : { fontSize: '1em' }
            }
            onKeyDown={props.onEditorKeyDown}
          ></pre>
        ) : (
          <pre
            id={`${idPrefix}-${id}`}
            className={SNodeContentText}
            style={
              isRoot
                ? { fontSize: '1.5em', lineHeight: 1.5 }
                : { fontSize: '1em' }
            }
            dangerouslySetInnerHTML={{ __html: contentHTML }}
          ></pre>
        )}
      </div>
    );
  },
  (prev, next) => {
    const { id, data, editAble, idPrefix, isRoot } = prev;
    const {
      id: nextId,
      data: nextData,
      editAble: nextEditAble,
      idPrefix: nextIdPrefix,
      isRoot: nextIsRoot,
    } = next;

    const equal =
      id === nextId &&
      isEqual(data, nextData) &&
      editAble === nextEditAble &&
      idPrefix === nextIdPrefix &&
      isRoot === nextIsRoot;
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
