import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { listDocuments } from '@root/model/api';

import {
  getExampleSourceData,
} from '@root/components/mind-map/render/model';
import { Payload } from '@root/components/mind-map/render/model/interface';
import { RawNode } from '@root/components/mind-map/render/node/interface';
import { documentEngine } from '@root/model/document-engine';
import { $invDocMindMap, move, modify, add, remove } from '@root/model/mind-map-model';
import { cpToTree, treeToCp } from './converter';
import { useObservable } from '../mind-map/render/hooks/observable-hook';

export const TreeViewControllerPortal = createContext<HTMLDivElement | null>(
  null,
);

export function useTreeViewControl() {
  const treeViewControlRef = useRef<HTMLDivElement>(null);
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    setPortal(treeViewControlRef.current);
  });

  return { treeViewControlRef, portal };
}

export const MindMapState = createContext<MindMapState | null>(null);

interface MindMapState {
  mindMapData: RawNode<Payload>;
  moveNodeTo: (nodeId: string, targetId: string, index: number) => void;
  modifyNode: (nodeId: string, content: string) => void;
  toggleCollapseNode: (nodeId: string) => void;
  addNode: (parentId: string, index: number, content: string) => void;
  delNode: (id: string) => void;
}

export function useMindMapState(): MindMapState {
  const initialTree = useMemo(getExampleSourceData, []);
  const engine = useMemo(
    () => documentEngine($invDocMindMap, treeToCp(initialTree)),
    [initialTree]
  );
  useEffect(() => engine.model.observe((data) => {
    console.log(data);
  }), [engine, engine.model]);
  const obTree = useMemo(() => engine.model.map(cpToTree), [engine.model]);
  const mindMapData = useObservable(obTree);

  const moveNodeTo = useCallback(
    (nodeId: string, targetId: string, index: number) =>
      engine.apply(move(nodeId, targetId, index)),
    [engine]
  );
  const modifyNode = useCallback(
    (nodeId: string, content: string) =>
      engine.apply(modify(nodeId, () => ({ stringProps: { content } }))),
    [engine]
  );
  const toggleCollapseNode = useCallback(
    (nodeId: string) =>
      engine.apply(
        modify(nodeId, ({ booleanProps = {} }) => ({
          booleanProps: {
            collapsed: !booleanProps.collapsed,
          },
        }))
      ),
    [engine]
  );
  const addNode = useCallback(
    (parentId: string, index: number, content: string) =>
      engine.apply(add(parentId, index, { stringProps: { content } })),
    [engine]
  );
  const delNode = useCallback(
    (id: string) => engine.apply(remove(id)),
    [engine]
  );

  return {
    mindMapData,
    moveNodeTo,
    modifyNode,
    toggleCollapseNode,
    addNode,
    delNode,
  };
}

listDocuments().then(console.log);