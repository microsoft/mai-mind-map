export * from './interface';
import { RawNode } from '../node/interface';
import { Payload } from './interface';
let i = 1;
const uuid = () => (i++).toString();

let exampleSourceData: RawNode<Payload> = {
  id: uuid(),
  payload: { content: 'Scott' },
  children: [
    { id: uuid(), payload: { content: 'Jian Lin' } },
    {
      id: uuid(),
      payload: { content: 'Yang Huangfu' },
      children: [
        { id: uuid(), payload: { content: 'Jianhui Zeng' } },
        { id: uuid(), payload: { content: 'Jiaming Mao' } },
        { id: uuid(), payload: { content: 'Zhengyi Xu' } },
        { id: uuid(), payload: { content: 'Che Yang' } },
        { id: uuid(), payload: { content: 'Kun Wang' } },
        { id: uuid(), payload: { content: 'Jianli Wei' } },
        { id: uuid(), payload: { content: 'Jiajun Yan' } },
        { id: uuid(), payload: { content: 'Yuanqing Zhu' } },
      ],
    },
    {
      id: uuid(),
      payload: { content: 'Jianjun Chen' },
      children: [
        { id: uuid(), payload: { content: 'Yu He' } },
        { id: uuid(), payload: { content: 'Zhuoyu Qian' } },
        { id: uuid(), payload: { content: 'Ying Wu' } },
        { id: uuid(), payload: { content: 'Pengyuan Wang' } },
        { id: uuid(), payload: { content: 'Yanjun Shen' } },
        { id: uuid(), payload: { content: 'Menci Naia' } },
        { id: uuid(), payload: { content: 'Lun Zhang' } },
      ],
    },
    {
      id: uuid(),
      payload: { content: 'Yuanjun Zhu' },
      children: [
        { id: uuid(), payload: { content: 'Chang Liu' } },
        { id: uuid(), payload: { content: 'Qikai Zhong' } },
        { id: uuid(), payload: { content: 'Yue Liu' } },
        { id: uuid(), payload: { content: 'Yi Huang' } },
        { id: uuid(), payload: { content: 'Ruinan Xu' } },
        { id: uuid(), payload: { content: 'Chunyang Huo' } },
        { id: uuid(), payload: { content: 'Jiayu Chen' } },
        { id: uuid(), payload: { content: 'Patrick Wang' } },
      ],
    },
    {
      id: uuid(),
      payload: { content: 'Qun Mi' },
      children: [
        { id: uuid(), payload: { content: 'Ming Yang' } },
        { id: uuid(), payload: { content: 'Juntong Liu' } },
        { id: uuid(), payload: { content: 'Zhenyu Shan' } },
        { id: uuid(), payload: { content: 'Qiang Wu' } },
        { id: uuid(), payload: { content: 'Yue Xiong' } },
        { id: uuid(), payload: { content: 'Man Yang' } },
        { id: uuid(), payload: { content: 'Zhentao Lu' } },
        { id: uuid(), payload: { content: 'Jing Li' } },
        { id: uuid(), payload: { content: 'Yu Tong' } },
        { id: uuid(), payload: { content: 'Zhengda Wang' } },
        { id: uuid(), payload: { content: 'Jingping Liu' } },
      ],
    },
    { id: uuid(), payload: { content: 'Jiashuang Shang' } },
  ],
};

export function getExampleSourceData() {
  return exampleSourceData;
}

export function expandTreeToArray<P>(root: RawNode<P> | null): RawNode<P>[] {
  if (!root) {
    return [];
  }
  const result: RawNode<P>[] = [];
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    if (!node) {
      continue;
    }
    result.push(node);
    if (node.children) {
      stack.push(...node.children);
    }
  }
  return result;
}

export function moveNodeTo(
  nodeId: string,
  targetId: string,
  index: number,
): RawNode<Payload> {
  console.log('moveNodeTo', nodeId, targetId, index);
  exampleSourceData = JSON.parse(JSON.stringify(exampleSourceData));

  const node = findNodeById(exampleSourceData, nodeId);

  const parent = findParentNodeById(exampleSourceData, nodeId);

  const target = findNodeById(exampleSourceData, targetId);

  if (!node || !parent || !target || parent === node) {
    return exampleSourceData;
  }
  if (!target.children) {
    target.children = [];
  }
  const parentChildren = parent.children || [];
  const targetChildren = target.children || [];

  const nodeIndex = parentChildren.findIndex((child) => child.id === nodeId);
  if (nodeIndex === -1) {
    return exampleSourceData;
  }

  let targetIndex = index;
  if (parentChildren === targetChildren) {
    if (index > nodeIndex) {
      targetIndex -= 1;
    }
  }

  parentChildren.splice(nodeIndex, 1);
  targetChildren.splice(targetIndex, 0, node);

  return exampleSourceData;
}

function findNodeById(
  node: RawNode<Payload>,
  id: string,
): RawNode<Payload> | null {
  if (node.id === id) {
    return node;
  }
  for (const child of node.children || []) {
    const found = findNodeById(child, id);
    if (found) {
      return found;
    }
  }
  return null;
}

function findParentNodeById(
  node: RawNode<Payload>,
  id: string,
): RawNode<Payload> | null {
  for (const child of node.children || []) {
    if (child.id === id) {
      return node;
    }
    const found = findParentNodeById(child, id);
    if (found) {
      return found;
    }
  }
  return null;
}

export function modifyNodeContent(
  nodeId: string,
  content: string,
): RawNode<Payload> {
  let node = findNodeById(exampleSourceData, nodeId);

  if (!node || node.payload.content === content) {
    return exampleSourceData;
  }

  exampleSourceData = JSON.parse(JSON.stringify(exampleSourceData));
  node = findNodeById(exampleSourceData, nodeId);
  if (node) {
    node.payload.content = content;
  }
  return exampleSourceData;
}

export function toggleCollapseNode(nodeId: string): RawNode<Payload> {
  const node = findNodeById(exampleSourceData, nodeId);

  if (!node || !node.children) {
    return exampleSourceData;
  }

  exampleSourceData = JSON.parse(JSON.stringify(exampleSourceData));
  const target = findNodeById(exampleSourceData, nodeId);
  if (target) {
    target.payload.collapsed = !target.payload.collapsed;
  }
  return exampleSourceData;
}

export function addNode(parentId: string, content: string): RawNode<Payload> {
  let parent = findNodeById(exampleSourceData, parentId);

  if (!parent) {
    return exampleSourceData;
  }

  exampleSourceData = JSON.parse(JSON.stringify(exampleSourceData));

  const newNode: RawNode<Payload> = {
    id: uuid(),
    payload: { content },
  };

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  parent = findNodeById(exampleSourceData, parentId)!;
  if (!parent.children) {
    parent.children = [];
  }
  parent.children.push(newNode);

  return exampleSourceData;
}

export function delNode(id: string): RawNode<Payload> {
  let parent = findParentNodeById(exampleSourceData, id);
  let index = parent?.children?.findIndex((child) => child.id === id);

  if (!parent || index === -1 || index === undefined) {
    return exampleSourceData;
  }

  exampleSourceData = JSON.parse(JSON.stringify(exampleSourceData));
  parent = findParentNodeById(exampleSourceData, id);
  index = parent?.children?.findIndex((child) => child.id === id);
  if (index !== undefined && index !== -1) {
    parent?.children?.splice(index, 1);
  }

  return exampleSourceData;
}
