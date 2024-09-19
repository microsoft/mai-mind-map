import { uuid } from '@base/atom';
import { css } from '@root/base/styled';
import React, { memo, useState, useRef, CSSProperties, useEffect } from 'react';
import { INDENT, focusTextArea, getTextAreaId } from './common';
import Toolbox from './tool-box';
import { TreeNode, ViewModel } from './view-model';

/**
 * ----------------------------------------------------------------------------------------------------
 * Styles for this file (install `vscode-style-components` ext for better dev)
 * ----------------------------------------------------------------------------------------------------
 */
const DotSize = 6;
const SArrow = css`
  flex: 0 0 ${DotSize * 2}px;
  cursor: pointer;
  font-size: 12px;
  transition: 100ms;
  text-align: center;
  background-color: white;
  color: rgba(0, 0, 0, 0.1);
`;
const SBox = css`
  position: relative;
  display: flex;
  align-items: stretch;
  &:hover .${SArrow} {
    color: black;
  }
  .drag-in {
    position: absolute;
    height: 2px;
    border-radius: 2px;
    bottom: 0;
    background-color: #0252ff;
  }
`;
const SHead = css`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: end;
  gap: ${INDENT - (DotSize * 1.5)}px;
`;
const SDot = css`
  flex: 0 0 ${DotSize}px;
  height: ${DotSize}px;
  margin-right: ${DotSize}px;
  border-radius: ${DotSize}px;
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    background: rgb(84, 165, 197);
    transform: scale(1.3);
    box-shadow: rgb(151, 212, 240) 0px 0px 0px 5px;
  }
  &[data-collapsed="true"] {
    background: rgba(0, 0, 0, 0.6);
    box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 0px 5px;
  }
`;
const SText = css`
  flex: 1 1 100%;
  border: none;
  resize: none;
  outline: none;
  appearance: none;
  height: 34px;
  line-height: 34px;
  overflow: hidden;
`;
const SDragItem = css`
  background-color: rgba(240, 248, 255, 0.75);
  border: 1px solid #0252ff;
  padding: 4px 4px 4px 20px;
  border-radius: 4px;
  position: absolute;
  top: -100000px;
  left: -100000px;
  z-index: -10000;
`;

/**
 * ------------------------------------------------------------------------------------------
 * Component to render the tree node as a line
 * ------------------------------------------------------------------------------------------
 */

function handleKey(
  e: React.KeyboardEvent,
  view: ViewModel,
  node: TreeNode,
  el: HTMLTextAreaElement,
  text: string,
  setText: (text: string) => void,
) {
  const { id, collapsed, children } = node;
  switch (e.keyCode) {
    case 27: // Escape
      el.blur();
      break;
    case 8: { // Backspace
      if (el.selectionStart !== 0) break;
      const prev = view.mergeToPrev(id, text);
      if (prev) {
        const at = text ? -text.length : undefined;
        setTimeout(() => focusTextArea(prev.id, at), 50);
      }
      break;
    }
    case 13: { // Enter
      // if (e.shiftKey) break;
      e.preventDefault();
      const left = text.slice(0, el.selectionStart);
      const right = text.slice(el.selectionStart);
      setText(left);
      const nextId = uuid();
      if (children?.length && !collapsed) {
        view.add(id, nextId, { content: right }, 0);
      } else {
        const parentId = view.child2Parent[id];
        const i = (view.all[parentId].children || []).indexOf(id);
        view.add(parentId, nextId, { content: right }, i + 1);
      }
      setTimeout(() => focusTextArea(nextId, 0), 50);
      break;
    }
    case 9: // Tab
      e.preventDefault();
      const at = el.selectionStart;
      const success = e.shiftKey ? view.levelUp(id) : view.levelDown(id);
      if (success) {
        setTimeout(() => focusTextArea(id, at), 50);
      }
      break;
    case 38: { // Arrow Up
    const prev = view.findPrevIncludingEx(id);
      if (prev) focusTextArea(prev.id);
      break;
    }
    case 40: { // Arrow Down
      const next = view.findNextIncludingEx(id);
      if (next) focusTextArea(next.id);
      break;
    }
    default: break
  }
}

/**
 * it's necessary to put textarea in an independent component
 * in this way, the parent component won't re-render when editing text
 */
function Editor(props: { view: ViewModel; node: TreeNode }) {
  const { view, node } = props;
  const { id, payload } = node;
  const [text, setText] = useState(payload.content);

  // update text if changes happened from props
  useEffect(() => setText(payload.content), [payload.content]);

  const format: CSSProperties = {
    backgroundColor: payload.hilight,
    fontWeight: payload.bold ? 'bold' : undefined,
    fontStyle: payload.italic ? 'italic' : undefined,
    textDecoration: payload.underline ? 'underline' : undefined,
  };
  return (
    <textarea
      id={getTextAreaId(id)}
      autoCapitalize="off"
      className={SText}
      style={format}
      value={text}
      onChange={e => setText(e.target.value)}
      onBlur={() => {
        if (text === payload.content) return;
        view.update(id, { ...payload, content: text });
      }}
      onKeyDown={(e) => {
        const el = e.target as HTMLTextAreaElement;
        handleKey(e, view, node, el, text, setText);
      }}
      onDragOver={e => e.preventDefault()}
    />
  );
}

const indicator = document.createElement('div');
indicator.classList.add(SDragItem);
document.body.appendChild(indicator);

function TreeLine(props: { view: ViewModel; node: TreeNode; depth: number }) {
  const { view, node, depth } = props;
  const { id, collapsed, children, payload } = node;
  const tbox = useRef<Toolbox>(null);
  const [dragIn, setDragIn] = useState(false);

  const hasChildren = Boolean(children?.length);
  const width = INDENT * (depth + 1) + DotSize * 2.5;

  return (
    <div
      className={SBox}
      onDragEnter={() => setDragIn(true)}
      onDragLeave={() => setDragIn(false)}
      onDrop={(e) => {
        setDragIn(false);
        const from = e.dataTransfer.getData('text/plain');
        if (view.get(from)) view.drag(from, id);
      }}
    >
      {dragIn && (
        <div className="drag-in" style={{ left: width, width: `calc(100% - ${width}px)` }} />
      )}
      <div className={SHead} style={{ width }}>
        {hasChildren && (
          <div
            className={SArrow}
            style={{ transform: collapsed ? 'rotate(-90deg)' : undefined }}
            onClick={() => view.toggleCollapsed(id)}>
            ▼
          </div>
        )}
        <div
          className={SDot}
          data-collapsed={collapsed}
          draggable
          onDragStart={(e) => {
            indicator.innerText = payload.content;
            e.dataTransfer.setDragImage(indicator, 0, 0);
            e.dataTransfer.setData('text/plain', id);
          }}
          onClick={(e) => {
            const el = e.target as HTMLDivElement;
            const { x, y, height } = el.getBoundingClientRect();
            tbox.current?.show(x, y + height + 6);
          }}
        />
        <Toolbox ref={tbox} view={view} node={node} />
      </div>
      <Editor view={view} node={node} />
    </div>
  );
}

export default memo(TreeLine);
