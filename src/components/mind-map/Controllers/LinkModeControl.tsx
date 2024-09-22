import { css } from '@base/styled';
import { FC } from 'react';
import { Curve, HybridLines, RoundedFoldingLine } from '../../icons/icons';
import { LinkMode } from '../render/hooks/constants';

const SLinkModeControl = css`
  display: flex;
  align-items: center;
  line-height: 20px;
  gap: 10px;
  margin: 5px 0 15px;
  & > .label {
    width: 70px;
  }
  & > .link-mode-item {
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

export const LinkModeControl: FC<{
  linkMode: LinkMode;
  setLinkMode: (val: LinkMode) => void;
}> = (props) => {
  const { linkMode, setLinkMode } = props;
  return (
    <div className={SLinkModeControl}>
      <span className="label">LinkMode:</span>
      {(
        [
          { c: <Curve />, k: LinkMode.CURVE, desc: 'Curve' },
          {
            c: <RoundedFoldingLine />,
            k: LinkMode.LINE,
            desc: 'Rounded folding line',
          },
          { c: <HybridLines />, k: LinkMode.HYBRID, desc: 'Hybrid lines' },
        ] as const
      ).map((d) => {
        return (
          <div
            key={d.k}
            className={`link-mode-item ${d.k} ${
              d.k === linkMode ? ' active' : ''
            }`}
            title={d.desc}
            onClick={() => {
              setLinkMode(d.k);
            }}
          >
            {d.c}
          </div>
        );
      })}
    </div>
  );
};
