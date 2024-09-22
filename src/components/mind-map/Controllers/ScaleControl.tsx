import { css } from '@base/styled';
import { FC } from 'react';

const SScaleControl = css`
  display: flex;
  align-items: center;
  gap: 10px;
  & > .label {
    width: 80px;
    text-align: right;
  }
`;

function scaler(val: number) {
  let re;
  if (val < 500) {
    re = val / 500;
  } else {
    re = 1 + (val - 500) / 100;
  }

  return Math.round(re * 100) / 100;
}

function scalerIn(val: number) {
  let re;
  if (val < 1) {
    re = val * 500;
  } else {
    re = 500 + (val - 1) * 100;
  }

  return Math.round(re);
}

export const ScaleControl: FC<{
  scale: number;
  setScale: (val: number) => void;
  min: number;
  max: number;
}> = (props) => {
  const { scale, setScale } = props;
  return (
    <div className={SScaleControl}>
      <span className="label">Scale:</span>
      <input
        type="range"
        name="Scale"
        value={scalerIn(scale)}
        min={scalerIn(props.min)}
        max={scalerIn(props.max)}
        onChange={(e) => setScale(scaler(+e.target.value))}
      ></input>{' '}
      <span style={{ display: 'inline-block', width: 50 }}>{scale}</span>
    </div>
  );
};
