import { css } from '@base/styled';
import { FC } from 'react';
import { MindMap, MindMapH } from '../../icons/icons';
import { Direction } from '../render';

const SDirections = css`
  display: flex;
  align-items: center;
  line-height: 20px;
  gap: 10px;
  margin: 5px 0 15px;
  & > .label {
    width: 70px;
  }
  & > .dir-item {
    background-color: aliceblue;
    padding: 1px 10px;
    cursor: pointer;
    border: 1px solid #1893ff;
    transform-origin: center;
    display: flex;
    padding: 5px;
    &.RL {
      transform: rotateY(180deg);
    }
    &.TB {
      transform: rotate(90deg);
    }
    &.BT {
      transform: rotate(270deg);
    }
    &.H {
      transform: rotate(90deg);
    }
    &:hover {
      background-color: #badfff;
    }
    &.active {
      background-color: #1893ff;
      color: white;
    }
  }
`;

export const LayoutControl: FC<{
  direction: Direction;
  setDirection: (val: Direction) => void;
}> = (props) => {
  const { direction, setDirection } = props;
  return (
    <div className={SDirections}>
      <span className="label">Layout:</span>
      {(
        [
          { c: <MindMap />, k: 'LR', desc: 'Left to right' },
          { c: <MindMap />, k: 'RL', desc: 'Right to left' },
          { c: <MindMap />, k: 'TB', desc: 'Top to bottom' },
          { c: <MindMap />, k: 'BT', desc: 'Bottom to top' },
          { c: <MindMapH />, k: 'H', desc: 'Horizontal' },
          { c: <MindMapH />, k: 'V', desc: 'Vertical' },
        ] as const
      ).map((d) => {
        return (
          <div
            key={d.k}
            className={`dir-item ${d.k} ${d.k === direction ? ' active' : ''}`}
            title={d.desc}
            onClick={() => {
              setDirection(d.k);
            }}
          >
            {d.c}
          </div>
        );
      })}
    </div>
  );
};
