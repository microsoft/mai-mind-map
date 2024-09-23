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
              c: 'Colorful',
              k: ColorMode.COLORFUL,
              desc: 'Various colors',
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
    </div>
  );
};
