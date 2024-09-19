import { Payload } from '@root/components/mind-map/render/model/interface';
import { RawNode } from '@root/components/mind-map/render/node/interface';
import { MindMapStateType } from '@root/components/state/mindMapState';
import { OutlineNode, handleSourceData } from './common';
export { type OutlineNode } from './common';

export class ViewModel {
  public all: Record<string, OutlineNode> = {};
  public child2Parent: Record<string, string> = {};
  // private notify: () => void;
  private mindMapSate: MindMapStateType | null;
  private _rootId = '';

  constructor(
    mindMapState: MindMapStateType | null,
    // notify: (view: ViewModel) => void,
  ) {
    // let cancelId = 0;
    // this.notify = () => {
    //   window.cancelAnimationFrame(cancelId);
    //   cancelId = window.requestAnimationFrame(() => notify(this));
    // };

    this.mindMapSate = mindMapState;
    if (!mindMapState) return;
    const handledData = handleSourceData(mindMapState.mindMapData);
    this.all = handledData.all;
    this.child2Parent = handledData.child2Parent;
    this._rootId = handledData.RootId;
  }

  public get root() {
    return this.all[this._rootId];
  }

  public get(id: string) {
    return this.all[id];
  }

  public toggleCollapsed(id: string) {
    if (id === this._rootId) return;
    this.mindMapSate?.toggleCollapseNode(id);

    // const node = this.all[id];
    // this.all[id] = { ...node, collapsed: !node.collapsed };
    // this.notify();
  }

  public findPrevIncludingEx(id: string) {
    if (id === this._rootId) return;
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
    while (prev.children?.length && !prev.payload.collapsed) {
      prevId = prev.children[prev.children.length - 1];
      prev = all[prevId];
    }
    return prev;
  }

  public findNextIncludingEx(id: string) {
    const { all, child2Parent } = this;
    const current = all[id];
    if (current.children?.length && !current.payload.collapsed) {
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
      // biome-ignore lint/style/noParameterAssign: <explanation>
      id = parentId;
      parentId = child2Parent[parentId];
    }
  }

  public levelUp(id: string) {
    if (id === this._rootId) return;
    const { all, child2Parent } = this;
    const parentId = child2Parent[id];
    if (parentId === this._rootId) return;

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

    let targetIndex = all[id].children?.length || 0;
    for (let i = index + 1; i < children.length; i++) {
      this.mindMapSate?.moveNodeTo(children[i], id, targetIndex++);
    }
    this.mindMapSate?.moveNodeTo(id, newParentId, parentIndex + 1);

    // // step3: remove current and the following siblings from parent
    // parent.children = children.slice(0, index);
    // all[parentId] = { ...parent };

    // // step4: add following siblings to current
    // const siblings = children.slice(index + 1);
    // const current = all[id];
    // current.children = (current.children || []).concat(siblings);
    // all[id] = { ...current };
    // // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    // // biome-ignore lint/complexity/noForEach: <explanation>
    // siblings.forEach((sid) => (child2Parent[sid] = id));

    // // step4: add current to newParent
    // child2Parent[id] = newParentId;
    // newParentChildren.splice(parentIndex + 1, 0, id);
    // all[newParentId] = { ...newParent, children: newParentChildren };

    // this.notify();
    return true;
  }

  public levelDown(id: string) {
    if (id === this._rootId) return;
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
    this.mindMapSate?.moveNodeTo(id, prevId, prev.children?.length || 0);

    // this.notify();
    return true;
  }

  public mergeToPrev(id: string, text: string) {
    if (id === this._rootId) return;
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
      while (prev.children?.length && !prev.payload.collapsed) {
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
      // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
      // biome-ignore lint/complexity/noForEach: <explanation>
      children.forEach((cid) => (child2Parent[cid] = prevId));
    }
    all[prevId] = { ...prev };

    this.mindMapSate?.delNode(id);
    this.mindMapSate?.modifyNode(prev.id, prev.payload.content);
    // this.notify();
    return prev;
  }

  public drag(fromId: string, toId: string) {
    if (fromId === this._rootId) return;
    if (fromId === toId) return;

    const { all, child2Parent } = this;
    const to = all[toId];
    if (child2Parent[fromId] === toId) return;

    // this.mindMapSate?.moveNodeTo(fromId, toId);

    // step1: remove [from] from parent
    const fpid = child2Parent[fromId];
    const fp = all[fpid];
    fp.children = fp.children?.filter((cid) => cid !== fromId);
    all[fpid] = { ...fp };

    // step2-1: add [from] to the children of [to]
    // biome-ignore lint/complexity/useOptionalChain: <explanation>
    if (to.children && to.children.length && !to.payload.collapsed) {
      to.children = [fromId, ...to.children];
      all[toId] = { ...to };
      child2Parent[fromId] = toId;
      this.mindMapSate?.moveNodeTo(fromId, toId, 0);
      // this.notify();
      return;
    }

    // step2-2: add [from] after [to]
    const tpid = child2Parent[toId];
    const tp = all[tpid];
    const children = tp.children || [];
    const i = children.indexOf(toId) + 1;
    if (i === 0) return;
    all[tpid] = {
      ...tp,
      children: [...children.slice(0, i), fromId, ...children.slice(i)],
    };
    child2Parent[fromId] = tpid;
    // this.notify();
    this.mindMapSate?.moveNodeTo(fromId, tpid, i);
  }

  public add(parent: string, id: string, payload: Payload, index?: number) {
    const { all, child2Parent } = this;
    const parentNode = all[parent] || all[this._rootId];
    const children = parentNode.children || [];
    if (index !== undefined && index >= 0) {
      children.splice(index, 0, id);
    } else {
      children.push(id);
    }
    all[parent] = { ...parentNode, children: [...children] };
    all[id] = { id, payload };
    child2Parent[id] = parent;
    this.mindMapSate?.addNodeWithPayLoad(parent, payload, index || 0);
    // this.notify();
  }

  public remove(id: string) {
    if (id === this._rootId) return;
    const { all, child2Parent } = this;
    const parent = child2Parent[id];
    const parentNode = all[parent];
    const node = all[id];
    const children = parentNode.children || [];
    parentNode.children = children.filter((cid) => cid !== id);
    all[parent] = { ...parentNode };
    delete all[id];
    delete child2Parent[id];
    // this.notify();
    this.mindMapSate?.delNode(id);
    return node;
  }

  public update(id: string, payload: Payload) {
    const { all } = this;
    const node = all[id];
    if (!node) return;
    all[id] = { ...node, payload };
    // this.notify();
    this.mindMapSate?.modifyNodePayload(id, payload);
    return all[id];
  }
}
