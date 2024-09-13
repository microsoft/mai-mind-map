import { css } from '@root/base/styled';
import React, { useMemo, useReducer, Fragment } from 'react';
import { INDENT } from './common';
import Treeline from './tree-line';
import { ViewModel } from './view-model';

/**
 * ----------------------------------------------------------------------------------------------------
 * Styles for this file (install `vscode-style-components` ext for better dev)
 * ----------------------------------------------------------------------------------------------------
 */
const SBody = css`
  max-width: 800px;
  margin: 0 auto;
`;
const SDocTitle = css`
  padding: 12px 0;
  margin: 0 0 12px;
  font-weight: normal;
  font-size: 20px;
  border-bottom: 1px dashed #ccc;
`;
const SSection = css`
  position: relative;
  &>.vline {
    position: absolute;
    top: 0;
    height: 100%;
    width: 1px;
    border-left: 1px dashed #ccc;
  }
`;

/**
 * ------------------------------------------------------------------------------------------
 * Component to render the outline view for the tree
 * ------------------------------------------------------------------------------------------
 */
export function OutlineView() {
  const forceUpdate = useReducer((x) => x + 1, 0)[1];
  const view = useMemo(() => new ViewModel(forceUpdate), [forceUpdate]);

  // @ts-ignore leave this for debug
  window._vm_ = view;

  /**
   * ① we need to make the tree here to make sure the re-render after data changed
   * ② Treeline is a memo component, so most of them won't re-render in a change loop
   */
  function makeTree(depth: number, list?: string[]): React.ReactNode {
    if (!list || list.length === 0) return null;
    const children = list.map((id, i) => {
      const node = view.all[id];
      return (
        <Fragment key={id}>
          <Treeline depth={depth} node={node} view={view} />
          {!node.collapsed && makeTree(depth + 1, node.children)}
        </Fragment>
      );
    });
    return (
      <section className={SSection}>
        {depth > 0 && <div className="vline" style={{ left: depth * INDENT + 5.5 }} />}
        {children}
      </section>
    );
  }

  return (
    <div className={SBody}>
      <h1 className={SDocTitle}>The root is {view.root.payload.content}</h1>
      {makeTree(0, view.root.children)}
    </div>
  );
}
