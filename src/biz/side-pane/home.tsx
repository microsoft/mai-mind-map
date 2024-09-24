import { css } from "@root/base/styled";
import { useCallback, useState } from "react";
import icons from "../components/icons";
import Popup from "../components/popup";

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
  height: 400px;
  width: 200px;
`;

function Pannel(props: {
  position: [x: number, y: number];
  hide: () => void;
}) {
  const { hide, position: [left, top] } = props;
  return (
    <Popup hide={hide} position={{ left, top }}>
      <div className={SPannel}>
      </div>
    </Popup>
  );
}

export function SideHome() {
  const [popup, setPopup] = useState<[number, number] | null>(null);
  const hide = useCallback(() => setPopup(null), []);
  return <>
    <div
      className={SHome + (popup ? ' more-active' : '')}
      onClick={(ev) => {
        const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
        setPopup([rect.left, rect.bottom]);
      }}
    >
      {icons.home}
    </div>
    {popup && (
      <Pannel position={popup} hide={hide} />
    )}
  </>
}
