import { css } from "@root/base/styled";
import { useState } from "react";
import ReactDOM from "react-dom";
import icons from "../components/icons";

const SMore = css`
  display: flex;
  align-items: center;
  height: 28px;
  width: 28px;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;

  &:hover, &.more-active {
    background-color: rgba(0,0,0,0.04);
  }
`;
const SPannel = css`
  z-index: 1000000;
  position: fixed;
  inset: 0;
  .pannel-content {
    position: absolute;
    border: 1px solid rgba(17, 31, 44, 0.12);
    box-shadow: rgba(0, 0, 0, 0.1) 1px 3px 8px 0px;
    background-color: rgb(255, 255, 255);
    border-radius: 4px;
    padding: 12px;
    height: 400px;
    width: 200px;
  }
`;

const container = document.createElement('div');
document.body.append(container);
function Pannel(props: {
  position: [x: number, y: number];
  hide: () => void;
}) {
  const { hide, position: [right, top] } = props;

  return ReactDOM.createPortal(
    <div
      className={SPannel}
      onClick={() => requestAnimationFrame(hide)}>
      <div
        className="pannel-content"
        style={{ right, top }}
        onClick={e => e.stopPropagation()}>
      </div>
    </div>,
    container,
  );
}

export function More() {
  const [pannelPos, setPanel] = useState<[number, number] | null>(null);
  return <>
    <div
      className={SMore + (pannelPos ? ' more-active' : '')}
      onClick={(ev) => {
        const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
        setPanel([window.innerWidth - rect.right, rect.bottom + 2]);
      }}
    >
      {icons.more}
    </div>
    {pannelPos && (
      <Pannel
        position={pannelPos}
        hide={() => setPanel(null)}
      />
    )}
  </>
}
