import { css } from "@root/base/styled";
import { useState } from "react";
import ReactDOM from "react-dom";
import icons from "../components/icons";

const SHome = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 6px;
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow: rgba(98, 123, 161, 0.28) 0px 0px 1px 0px, rgba(98, 123, 161, 0.08) 0px 2px 8px 0px;
  background-color: rgba(255, 255, 255, 1);
  color: rgba(23, 26, 29, 0.94);
  font-size: 20px;
  line-height: 20px;
  user-select: none;
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
  const { hide, position: [left, top] } = props;

  return ReactDOM.createPortal(
    <div
      className={SPannel}
      onClick={() => requestAnimationFrame(hide)}>
      <div
        className="pannel-content"
        style={{ left, top }}
        onClick={e => e.stopPropagation()}>
      </div>
    </div>,
    container,
  );
}

export function SideHome() {
  const [pannelPos, setPanel] = useState<[number, number] | null>(null);
  return <>
    <div
      className={SHome + (pannelPos ? ' more-active' : '')}
      onClick={(ev) => {
        const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
        setPanel([rect.left, rect.bottom]);
      }}
    >
      {icons.home}
    </div>
    {pannelPos && (
      <Pannel
        position={pannelPos}
        hide={() => setPanel(null)}
      />
    )}
  </>
}
