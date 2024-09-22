import { css } from '@base/styled';
import { FC } from 'react';
import { Curve, HybridLines, RoundedFoldingLine } from '../../icons/icons';
import { ColorMode } from '../render/hooks/constants';

const SColorModeControl = css`
  display: flex;
  align-items: center;
  line-height: 20px;
  gap: 10px;
  margin: 5px 0 15px;
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

export const ColorModeControl: FC<{
  colorMode: ColorMode;
  setColorMode: (val: ColorMode) => void;
}> = (props) => {
  const { colorMode, setColorMode } = props;
  return (
    <div>
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
    </div>
  );
};
