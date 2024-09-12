import { css } from '@base/styled';
import { FC } from 'react';
import { Direction } from './render';

const SDirections = css`
  display: flex;
  line-height: 20px;
  gap: 4px;

  & > .dir-item {
    background-color: aliceblue;
    padding: 1px 10px;
    cursor: pointer;
    border: 1px solid #1893ff;
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
      {(['LR', 'RL', 'TB', 'BT', 'H', 'V'] as const).map((d) => {
        return (
          <div
            key={d}
            className={`dir-item ${d === direction ? ' active' : ''}`}
            onClick={() => {
              setDirection(d);
            }}
          >
            {d}
          </div>
        );
      })}
    </div>
  );
};
