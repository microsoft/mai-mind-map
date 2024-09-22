import { css } from '@base/styled';
import { Payload } from '@root/components/mind-map/render/model/interface';
import { RawNode } from '@root/components/mind-map/render/node/interface';
import { MindMapState } from '@root/components/state/mindMapState';
import { MindMapStateType } from '@root/components/state/mindMapState';
import { throttle } from 'lodash';
import { FC, Fragment, useContext } from 'react';
import { ColorMode } from '../render/hooks/constants';

const SColorModeControlBox = css`
  margin: 5px 0 15px;
`;
const SColorModeControl = css`
  display: flex;
  align-items: center;
  line-height: 20px;
  gap: 10px;
  margin-bottom: 10px;
  & > .label {
    width: 80px;
    text-align: right;
  }
  & > .mode-item {
    background-color: aliceblue;
    padding: 1px 10px;
    cursor: pointer;
    border: 1px solid #1893ff;
    transform-origin: center;
    display: flex;
    padding: 5px;
    &:hover {
      background-color: #badfff;
    }
    &.active {
      background-color: #1893ff;
      color: white;
    }
  }
`;
const SColorPane = css`
  background: linear-gradient(90deg, red, yellow, green, cyan, blue, magenta);
  height: 20px;
`;
const SDefaultPane = css`
  background: linear-gradient(90deg, #0172dc, #ecf2fb, #fff);
  height: 20px;
`;

const SColoringBtn = css`
  margin-top: 5px;
  display: inline-block;
  padding: 5px 10px;
  border: 1px solid #1893ff;
  cursor: pointer;
  background-color: aliceblue;
  &:hover {
    background-color: #badfff;
  }
`;

const rootColor = '#212429';
const colors = [
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
];
function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function ColoringNode(
  node: RawNode<Payload>,
  color: string,
  modifyNodePayload: (nodeId: string, payload: Payload) => void,
) {
  modifyNodePayload(
    node.id,
    Object.assign({}, node.payload, { hilight: color }),
  );
  node.children?.forEach((child, ind) => {
    ColoringNode(child, color, modifyNodePayload);
  });
}

function ColoringMindMap(tresState: MindMapStateType | null) {
  if (!tresState) return;
  const colorArray = shuffle([...colors]);
  const root = tresState.mindMapData;
  const modifyNodePayload = tresState.modifyNodePayload;
  modifyNodePayload(
    root.id,
    Object.assign({}, root.payload, { hilight: rootColor }),
  );
  root.children?.forEach((node, ind) => {
    let index = ind % colors.length;
    ColoringNode(node, colorArray[index], modifyNodePayload);
  });
}
const throttleColoringMindMap = throttle(ColoringMindMap, 1000);

export const ColorModeControl: FC<{
  colorMode: ColorMode;
  setColorMode: (val: ColorMode) => void;
}> = (props) => {
  const { colorMode, setColorMode } = props;
  const treeState = useContext(MindMapState);
  return (
    <div className={SColorModeControlBox}>
      <div className={SColorModeControl}>
        <span className="label">ColorMode:</span>
        {(
          [
            {
              c: 'Default',
              k: ColorMode.DEFAULT,
              desc: 'System default color',
            },
            {
              c: 'Custom',
              k: ColorMode.CUSTOM,
              desc: 'Customize color',
            },
          ] as const
        ).map((d) => {
          return (
            <div
              key={d.k}
              className={`mode-item ${d.k} ${
                d.k === colorMode ? ' active' : ''
              }`}
              title={d.desc}
              onClick={() => {
                setColorMode(d.k);
              }}
            >
              {d.c}
            </div>
          );
        })}
      </div>
      {colorMode === ColorMode.DEFAULT ? (
        <div className={SDefaultPane}></div>
      ) : (
        <Fragment>
          <div className={SColorPane}></div>
          <div>
            <button
              className={SColoringBtn}
              onClick={() => {
                throttleColoringMindMap(treeState);
              }}
            >
              {' '}
              Coloring my MindMap{' '}
            </button>
          </div>
        </Fragment>
      )}
    </div>
  );
};
