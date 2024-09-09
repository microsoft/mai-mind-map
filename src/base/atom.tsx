import { createContext, PureComponent, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

const UNIQ = Symbol('Fingerprint');
const uuid = () => Math.round((Math.random() + 1) * Date.now()).toString(36);

type Caller<T> = (data: T) => void;
type Reduce<T> = (data: T) => T;
type Change<T> = (ch: Reduce<T> | T) => void;
type Creator<T, A> = (get: () => T, set: Change<T>, query: QueryOtherAtom) => A;

export interface Atom<T> {
  key: string;
  [UNIQ]: T;
  /**
   * Just like the middleware of redux to decorate the dispatch function
   * eg. for local debug: you can use proxy to track the change stack
   */
  proxy?: (set: Change<T>) => Change<T>;
}
export interface AtomX<T, A> extends Atom<T> {
  creator: Creator<T, A>;
}

export type Creature<M> = M extends AtomX<any, infer A> ? A : unknown;

export interface QueryOtherAtom {
  <T>(atom: Atom<T>): { data: T; change: Change<T> };
  <T, A>(atom: AtomX<T, A>): { data: T; change: Change<T>; actions: A };
}

interface AtomState<T, A> {
  data: T;
  change: (ch: Reduce<T> | T) => void;
  listen: (cb: Caller<T>) => VoidFunction;
  actions: A;
}

interface Query {
  <T, A>(a: Atom<T> | AtomX<T, A>, init?: T): AtomState<T, A>;
  cache: { [k: string]: any };
}
const Context = createContext<Query>({} as any);

function buildAtomState<T, A>(atom: AtomX<T, A> | Atom<T>, query: QueryOtherAtom, init?: T) {
  const listener = new Set<Caller<T>>();

  let change = (ch: Reduce<T> | T) => {
    const prev = state.data;
    const next = typeof ch === 'function' ? (ch as Reduce<T>)(prev) : ch;
    if (prev === next) return;
    state.data = next;
    listener.forEach((call) => call(next));
  };
  if (atom.proxy) change = atom.proxy(change);

  const state: AtomState<T, A | undefined> = {
    data: init === undefined ? atom[UNIQ] : init,
    change,
    listen: (call) => {
      listener.add(call);
      return () => listener.delete(call);
    },
    actions: (atom as any).creator?.(() => state.data, change, query),
  };
  return state;
}

function buildQuery() {
  const map: { [k: string]: AtomState<any, any> } = {};
  const cache: { [k: string]: any } = {};
  function query<T, A>(atom: AtomX<T, A> | Atom<T>, init?: T): AtomState<T, A> {
    const { key } = atom;
    let state = map[key];
    if (state === undefined) {
      /* dynamically register atom state */
      state = buildAtomState(atom, query, init);
      map[key] = state;
    }
    return state;
  };
  query.cache = cache;
  return query;
}

export function atom<T>(initial: T): Atom<T>;
export function atom<T, A>(initial: T, creator: Creator<T, A>): AtomX<T, A>;
export function atom(initial: any, creator?: any): any {
  return { key: uuid(), [UNIQ]: initial, creator };
}

export function useChange<T, A>(atom: AtomX<T, A>): [Change<T>, A];
export function useChange<T>(atom: Atom<T>): Change<T>;
export function useChange(atom: any): any {
  const { change, actions } = useContext(Context)(atom);
  if (atom.creator) return [change, actions];
  return change;
}

export function useAtom<T, A = unknown>(atom: Atom<T> | AtomX<T, A>, init?: T) {
  const { data, listen, change, actions } = useContext(Context)(atom, init);
  const [v, set] = useState(data);
  useEffect(() => listen(set), []);
  return [v, change, actions] as const;
}

export function useCache<T>(key: string, defaultValue: T): T {
  const { cache } = useContext(Context);
  const value = cache[key];
  if (value=== undefined) {
    cache[key] = defaultValue;
    return defaultValue;
  }
  return value;
}

export const WithStore = (props: { children: ReactNode }) => {
  const query = useMemo(buildQuery, []);
  return <Context.Provider value={query}>{props.children}</Context.Provider>;
};

export class LinkStore<P = {}, S = {}> extends PureComponent<P, S> {
  static contextType = Context;
  private __atoms__ = new Map<string, VoidFunction>();

  componentWillUnmount() {
    this.__atoms__.forEach((unbind) => unbind());
    this.__atoms__.clear();
  }

  protected useChange<T, A>(atom: AtomX<T, A>): [Change<T>, A];
  protected useChange<T>(atom: Atom<T>): Change<T>;
  protected useChange(atom: AtomX<any, any>): any {
    // @ts-ignore
    const { change, actions } = this.context(atom);
    if (actions) return [change, actions];
    return change;
  }

  protected useAtom<T, A>(atom: Atom<T> | AtomX<T, A>, init?: T) {
    const { __atoms__, context } = this;
    // @ts-ignore
    const { data, listen, change, actions } = context(atom, init) as AtomState<T, A>;
    if (!__atoms__.has(atom.key)) {
      __atoms__.set(
        atom.key,
        listen(() => this.forceUpdate()),
      );
    }
    return [data, change, actions] as const;
  }

  protected useNoneReactiveAtom<T, A>(atom: Atom<T> | AtomX<T, A>, init?: T) {
    // @ts-ignore
    const { data, change, actions } = this.context(atom, init) as AtomState<T, A>;
    return [data, change, actions] as const;
  }
}
