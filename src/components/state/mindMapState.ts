import { debounce } from 'lodash';
import { createDocument, getDocument, updateDocument } from '@root/model/api';

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
  MindMapCp,
  add,
  modify,
  move,
  remove,
} from '@root/model/mind-map-model';
import { useNavigate } from 'react-router-dom';
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
  outputCP: () => MindMapCp;
}

type Box<T> = { value: T };

const box = <T>(value: T) => ({ value });
type LoadState =
  | {
      type: 'init';
    }
  | {
      type: 'creating';
    }
  | {
      type: 'loading';
      id: string;
    }
  | {
      type: 'loaded';
      id: string;
    };

const init = (): LoadState => ({ type: 'init' });
const creating = (): LoadState => ({ type: 'creating' });
const loading = (id: string): LoadState => ({ type: 'loading', id });
const loaded = (id: string): LoadState => ({ type: 'loaded', id });

export function useMindMapState(id: string): {
  loadState: LoadState;
  treeState: MindMapStateType;
} {
  const engine = useMemo(() => documentEngine($invDocMindMap, {}), []);
  const stateBox = useMemo<Box<LoadState>>(() => box(init()), []);
  const [loadState, setLoadState] = useState<LoadState>(init());
  const debounceSetLoadState = useRef(debounce(setLoadState, 10));
  const updateLoadState = useCallback(
    (value: LoadState) => {
      stateBox.value = value;
      debounceSetLoadState.current(value);
    },
    [stateBox],
  );
  const navigate = useNavigate();
  useEffect(() => {
    const { value: state } = stateBox;
    if (
      id &&
      (state.type === 'init' || state.type === 'creating' || state.id !== id)
    ) {
      updateLoadState(loading(id));
      console.log('Loading', id);
      getDocument(id).then((cp) => {
        const { value: stat } = stateBox;
        if (stat.type === 'loading' && stat.id === id) {
          console.log('Loaded', id);
          engine.load(cp);
          updateLoadState(loaded(id));
        }
      });
    } else if (!id && state.type !== 'creating') {
      updateLoadState(creating());
      console.log('Creating');
      createDocument().then((id) => {
        const { value: stat } = stateBox;
        if (stat.type === 'creating') {
          console.log('Created', id);
          navigate(`/edit/${id}`);
        }
      });
    }
    return () => {
      const { value: stat } = stateBox;
      if (stat.type === 'loaded') {
        const content = engine.model.peek();
        updateDocument(stat.id, content).then(console.log);
      }
    };
  }, [id, engine, stateBox, updateLoadState, navigate]);
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
    loadState,
    treeState: {
      mindMapData,
      moveNodeTo,
      modifyNode,
      modifyNodePayload,
      toggleCollapseNode,
      addNode,
      addNodeWithPayLoad,
      delNode,
      outputCP: () => engine.model.peek(),
    },
  };
}
