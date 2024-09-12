import { mockFromSampleData } from './common';

export interface TreeNodePayload {
  content: string;
  hilight?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  link?: string;
}

export interface TreeNode {
  id: string;
  payload: TreeNodePayload;
  collapsed?: boolean;
  children?: string[];
}

let RootId = 'root';

export class ViewModel {
  public all: Record<string, TreeNode> = {};
  public child2Parent: Record<string, string> = {};
  private notify: () => void;

  constructor(notify: (view: ViewModel) => void) {
    const mock = mockFromSampleData();
    this.all = mock.all;
    this.child2Parent = mock.child2Parent;
    RootId = mock.RootId;

    let cancelId = 0;
    this.notify = () => {
      window.cancelAnimationFrame(cancelId);
      cancelId = window.requestAnimationFrame(() => notify(this));
    };
  }

  public get root() {
    return this.all[RootId];
  }

  public get(id: string) {
    return this.all[id];
  }

  public toggleCollapsed(id: string) {
    if (id === RootId) return;
    const node = this.all[id];
    this.all[id] = { ...node, collapsed: !node.collapsed };
    this.notify();
  }

  public findPrevIncludingEx(id: string) {
    if (id === RootId) return;
    const { all, child2Parent } = this;
    // get parent
    let prevId = child2Parent[id];
    let prev = all[prevId];

    if (!prev.children) return;
    // get index in parent
    const index = prev.children.indexOf(id);
    if (index < 0) return;
    if (index === 0) return prev;

    prevId = prev.children[index - 1];
    prev = all[prevId];
    while (prev.children && prev.children.length && !prev.collapsed) {
      prevId = prev.children[prev.children.length - 1];
      prev = all[prevId];
    }
    return prev;
  }

  public findNextIncludingEx(id: string) {
    const { all, child2Parent } = this;
    const current = all[id];
    if (current.children && current.children.length && !current.collapsed) {
      const first = current.children[0];
      return all[first];
    }

    let parentId = child2Parent[id];
    while (parentId) {
      const list = all[parentId].children || [];
      const index = list.indexOf(id);
      if (index < 0) return;
      const next = list[index + 1];
      if (next) return all[next];
      id = parentId;
      parentId = child2Parent[parentId];
    }
  }

  public levelUp(id: string) {
    if (id === RootId) return;
    const { all, child2Parent } = this;
    const parentId = child2Parent[id];
    if (parentId === RootId) return;

    // step1: get index in parent children
    const parent = all[parentId];
    const children = parent.children || [];
    const index = children.indexOf(id);
    if (index < 0) return;

    // step2: get index in new parent children
    const newParentId = child2Parent[parentId];
    const newParent = all[newParentId];
    const newParentChildren = newParent.children || [];
    const parentIndex = newParentChildren.indexOf(parentId);
    if (parentIndex < 0) return;

    // step3: remove current and the following siblings from parent
    parent.children = children.slice(0, index);
    all[parentId] = { ...parent };

    // step4: add following siblings to current
    const siblings = children.slice(index + 1);
    const current = all[id];
    current.children = (current.children || []).concat(siblings);
    all[id] = { ...current };
    siblings.forEach((sid) => (child2Parent[sid] = id));

    // step4: add current to newParent
    child2Parent[id] = newParentId;
    newParentChildren.splice(parentIndex + 1, 0, id);
    all[newParentId] = { ...newParent, children: newParentChildren };

    this.notify();
    return true;
  }

  public levelDown(id: string) {
    if (id === RootId) return;
    const { all, child2Parent } = this;

    // step1: get index in parent children
    const parentId = child2Parent[id];
    const parent = all[parentId];
    const parentChildren = parent.children || [];
    const index = parentChildren.indexOf(id);
    // note: the firt child is not allow to to this
    if (index < 1) return;

    // step2: find prev sibling and move this from parent to prev
    const prevId = parentChildren[index - 1];
    const prev = all[prevId];
    prev.children = prev.children ? [...prev.children, id] : [id];
    parent.children = parentChildren.filter((cid) => cid !== id);
    all[prevId] = { ...prev };
    all[parentId] = { ...parent };
    child2Parent[id] = prevId;

    this.notify();
    return true;
  }

  public mergeToPrev(id: string, text: string) {
    if (id === RootId) return;
    const { all, child2Parent } = this;
    const parentId = child2Parent[id];
    const parentNode = all[parentId];
    const current = all[id];

    // step1: remove from parent
    const parentChildren = parentNode.children || [];
    const index = parentChildren.indexOf(id);
    parentNode.children = parentChildren.filter((cid) => cid !== id);
    all[parentId] = { ...parentNode };
    delete all[id];
    delete child2Parent[id];

    // step2: find prev item
    let prevId = parentId;
    let prev = parentNode;
    if (index > 0) {
      prevId = parentChildren[index - 1];
      prev = all[prevId];
      while (prev.children && prev.children.length && !prev.collapsed) {
        prevId = prev.children[prev.children.length - 1];
        prev = all[prevId];
      }
    }

    // step3: merge current content to prev
    const { children = [] } = current;
    prev.payload = { ...prev.payload, content: prev.payload.content + text };
    if (children.length) {
      prev.children = prev.children
        ? [...prev.children, ...children]
        : children;
      children.forEach((cid) => (child2Parent[cid] = prevId));
    }
    all[prevId] = { ...prev };

    this.notify();
    return prev;
  }

  public add(
    parent: string,
    id: string,
    payload: TreeNodePayload,
    index?: number,
  ) {
    const { all, child2Parent } = this;
    const parentNode = all[parent] || all[RootId];
    const children = parentNode.children || [];
    if (index !== undefined && index >= 0) {
      children.splice(index, 0, id);
    } else {
      children.push(id);
    }
    all[parent] = { ...parentNode, children: [...children] };
    all[id] = { id, payload };
    child2Parent[id] = parent;
    this.notify();
  }

  public remove(id: string) {
    if (id === RootId) return;
    const { all, child2Parent } = this;
    const parent = child2Parent[id];
    const parentNode = all[parent];
    const node = all[id];
    const children = parentNode.children || [];
    parentNode.children = children.filter((cid) => cid !== id);
    all[parent] = { ...parentNode };
    delete all[id];
    delete child2Parent[id];
    this.notify();
    return node;
  }

  public update(id: string, payload: TreeNodePayload) {
    const { all } = this;
    const node = all[id];
    if (!node) return;
    all[id] = { ...node, payload };
    this.notify();
    return all[id];
  }
}
