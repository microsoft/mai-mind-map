import { Payload } from '@root/components/mind-map/render/model/interface';
import { RawNode } from '@root/components/mind-map/render/node/interface';
import { MindMapStateType } from '@root/components/state/mindMapState';
import { hsl } from 'd3-color';
import { debounce } from 'lodash';
import { useEffect } from 'react';

const rootColor = '#212429';
function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
const colors = shuffle([
  '#E7A400',
  '#E67505',
  '#EB4824',
  '#E82C41',
  '#D7257D',
  '#B91CBF',
  '#9529C2',
  '#6D37CD',
  '#4A43CB',
  '#2052CB',
  '#0067BF',
  '#0C74A1',
  '#1A7F7C',
  '#288A56',
  '#379539',
  '#63686E',
  '#666666',
]);

function ColoringNode(
  node: RawNode<Payload>,
  color: string,
  modifyNodePayload: (nodeId: string, payload: Payload) => void,
) {
  if (node.payload.hilight !== color) {
    modifyNodePayload(
      node.id,
      Object.assign({}, node.payload, { hilight: color }),
    );
  }
  node.children?.forEach((child, ind) => {
    ColoringNode(child, color, modifyNodePayload);
  });
}

function ColoringMindMap(tresState: MindMapStateType | null) {
  if (!tresState) return;

  // Coloring root node
  const root = tresState.mindMapData;
  const modifyNodePayload = tresState.modifyNodePayload;
  if (!root.payload.hilight) {
    modifyNodePayload(
      root.id,
      Object.assign({}, root.payload, { hilight: rootColor }),
    );
  }

  // Coloring sub nodes
  const colorSet = new Set<string>(colors);
  root.children?.forEach((node) => {
    if (node.payload.hilight) {
      colorSet.delete(node.payload.hilight);
      ColoringNode(node, node.payload.hilight, modifyNodePayload);
    }
  });

  root.children?.forEach((node) => {
    if (!node.payload.hilight) {
      if (colorSet.size > 0) {
        const color = colorSet.values().next().value;
        colorSet.delete(color);
        ColoringNode(node, color, modifyNodePayload);
      } else {
        const randomColor = hsl(Math.random() * 360, 0.8, 0.6).toString();
        ColoringNode(node, randomColor, modifyNodePayload);
      }
    }
  });
}
const debounceColoringMindMap = debounce(ColoringMindMap, 1000);

export function useAutoColoringMindMap(tresState: MindMapStateType | null) {
  useEffect(() => {
    debounceColoringMindMap(tresState);
  }, [tresState]);
}
