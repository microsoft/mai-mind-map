import { getDocument, listDocuments, updateDocument } from '@root/model/api';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getExampleSourceData } from '@root/components/mind-map/render/model';
import { Payload } from '@root/components/mind-map/render/model/interface';
import { RawNode } from '@root/components/mind-map/render/node/interface';
import { documentEngine } from '@root/model/document-engine';
import {
  $invDocMindMap,
  add,
  modify,
  move,
  remove,
} from '@root/model/mind-map-model';
import { useObservable } from '../mind-map/render/hooks/observable-hook';
import { cpToTree, payloadToProps, treeToCp } from './converter';

export const MindMapState = createContext<MindMapStateType | null>(null);

export interface MindMapStateType {
  mindMapData: RawNode<Payload>;
  moveNodeTo: (nodeId: string, targetId: string, index: number) => void;
  modifyNode: (nodeId: string, content: string) => void;
  modifyNodePayload: (nodeId: string, payload: Payload) => void;
  toggleCollapseNode: (nodeId: string) => void;
  addNode: (parentId: string, index: number, content: string) => void;
  delNode: (id: string) => void;
  addNodeWithPayLoad: (
    parentId: string,
    payload: Payload,
    index: number,
  ) => void;
}

export function useMindMapState(id: string): MindMapStateType {
  const engine = useMemo(() => documentEngine($invDocMindMap, {}), []);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (id) {
      engine.load({ '00000000': { stringProps: { content: { t: Date.now(), v: 'Loading...' }}}});
      setLoading(true);
      console.log('Loading', id);
      getDocument(id).then((cp) => {
        console.log('Loaded', id, cp);
        engine.load(cp);
        setLoading(false);
      });
    }
    return () => {
      if (id && !loading) {
        const content = engine.model.peek();
        console.log('Saving', id, content);
        updateDocument(id, content).then(console.log);
      }
    };
  }, [id, engine, loading]);
  useEffect(() => {
    (window as any).model = engine.model;
    return engine.model.observe((data) => {
      console.log(data);
    });
  }, [engine, engine.model]);
  const obTree = useMemo(() => engine.model.map(cpToTree), [engine.model]);
  const mindMapData = useObservable(obTree);

  const moveNodeTo = useCallback(
    (nodeId: string, targetId: string, index: number) =>
      engine.apply(move(nodeId, targetId, index)),
    [engine],
  );
  const modifyNode = useCallback(
    (nodeId: string, content: string) =>
      engine.apply(modify(nodeId, () => ({ stringProps: { content } }))),
    [engine],
  );
  const modifyNodePayload = useCallback(
    (nodeId: string, payload: Payload) =>
      engine.apply(
        modify(nodeId, () => {
          return payloadToProps(payload);
        }),
      ),
    [engine],
  );
  const toggleCollapseNode = useCallback(
    (nodeId: string) =>
      engine.apply(
        modify(nodeId, ({ booleanProps = {} }) => ({
          booleanProps: {
            collapsed: !booleanProps.collapsed,
          },
        })),
      ),
    [engine],
  );
  const addNode = useCallback(
    (parentId: string, index: number, content: string) =>
      engine.apply(add(parentId, index, { stringProps: { content } })),
    [engine],
  );
  const addNodeWithPayLoad = useCallback(
    (parentId: string, payload: Payload, index: number) =>
      engine.apply(add(parentId, index, payloadToProps(payload))),
    [engine],
  );

  const delNode = useCallback(
    (id: string) => engine.apply(remove(id)),
    [engine],
  );

  return {
    mindMapData,
    moveNodeTo,
    modifyNode,
    modifyNodePayload,
    toggleCollapseNode,
    addNode,
    addNodeWithPayLoad,
    delNode,
  };
}
