import { css } from '@base/styled';
import React, { FC } from 'react';
import { Add, Origin, Sub } from '../../icons/icons';
import { resetDrawingTransformEventName } from '../render/hooks/useRenderWithD3';

const SScaleControl = css`
  display: flex;
  align-items: center;
  gap: 10px;
  & > .label {
    width: 80px;
    text-align: right;
  }
`;
const sBtn = css`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  font-size: 20px;
  padding: 0;
  border: 0;
  border-radius: 10px;
  color: #333;
  cursor: pointer;
  background-color: white;
  &:hover {
    background-color: #ddd;
  }
`;
const hoverShadow = css`
  &:hover {
    box-shadow: 0 0 10px 0px rgba(0, 0, 0, 0.5);
  }
`;

function scaler(val: number) {
  let re;
  if (val < 500) {
    re = val / 500;
  } else {
    re = 1 + (val - 500) / 100;
  }

  return Math.floor(re * 10 + 0.5) / 10;
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
  style?: React.CSSProperties;
}> = (props) => {
  const { scale, setScale, style } = props;
  return (
    <div className={SScaleControl} style={style}>
      <button
        title="Reset scale and position"
        className={`${sBtn} ${hoverShadow}`}
        onClick={() => {
          setScale(1);
          window.dispatchEvent(new Event(resetDrawingTransformEventName));
        }}
      >
        <Origin />
      </button>
      <button
        title="Decrease scale"
        className={`${sBtn} ${hoverShadow}`}
        onClick={() => {
          if (scale > props.min) setScale((scale * 10 - 1) / 10);
        }}
      >
        <Sub />
      </button>
      <input
        type="range"
        name="Scale"
        value={scalerIn(scale)}
        min={scalerIn(props.min)}
        max={scalerIn(props.max)}
        onChange={(e) => setScale(scaler(+e.target.value))}
      ></input>{' '}
      <button
        title="Increase scale"
        className={`${sBtn} ${hoverShadow}`}
        onClick={() => {
          if (scale < props.max) setScale((scale * 10 + 1) / 10);
        }}
      >
        <Add />
      </button>
      <input
        style={{
          display: 'inline-block',
          width: 50,
          border: 'none',
          overflow: 'hidden',
        }}
        type="number"
        step={0.1}
        value={scale}
        onChange={(e) => {
          const val = +e.target.value;
          if (val >= props.min && val <= props.max) {
            setScale(val);
          }
        }}
      />
    </div>
  );
};
