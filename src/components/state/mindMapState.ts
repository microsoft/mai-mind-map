import { createContext, useCallback, useEffect, useRef, useState } from 'react';

import {
  addNode as addNodeFun,
  delNode as delNodeFun,
  getExampleSourceData,
  modifyNodeContent,
  moveNodeTo as moveNodeToFun,
  toggleCollapseNode as toggleCollapseNodeFun,
} from '@root/components/mind-map/render/model';
import { Payload } from '@root/components/mind-map/render/model/interface';
import { RawNode } from '@root/components/mind-map/render/node/interface';

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
  setTreeData: React.Dispatch<React.SetStateAction<RawNode<Payload>>>;
  moveNodeTo: (nodeId: string, targetId: string, index: number) => void;
  modifyNode: (nodeId: string, content: string) => void;
  toggleCollapseNode: (nodeId: string) => void;
  addNode: (parentId: string, content: string) => void;
  delNode: (id: string) => void;
}

export function useMindMapState(): MindMapState {
  const [mindMapData, setTreeData] = useState(getExampleSourceData());

  const moveNodeTo = useCallback(
    (nodeId: string, targetId: string, index: number) => {
      setTreeData(moveNodeToFun(nodeId, targetId, index));
    },
    [],
  );
  const modifyNode = useCallback((nodeId: string, content: string) => {
    setTreeData(modifyNodeContent(nodeId, content));
  }, []);
  const toggleCollapseNode = useCallback((nodeId: string) => {
    setTreeData(toggleCollapseNodeFun(nodeId));
  }, []);
  const addNode = useCallback((parentId: string, content: string) => {
    setTreeData(addNodeFun(parentId, content));
  }, []);
  const delNode = useCallback((id: string) => {
    setTreeData(delNodeFun(id));
  }, []);

  return {
    mindMapData,
    setTreeData,
    moveNodeTo,
    modifyNode,
    toggleCollapseNode,
    addNode,
    delNode,
  };
}
