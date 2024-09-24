import { css } from "@root/base/styled";
import { useCallback, useState } from "react";
import icons from "../components/icons";
import Popup from "../components/popup";

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
  height: 400px;
  width: 200px;
`;

function Pannel(props: {
  position: [x: number, y: number];
  hide: () => void;
}) {
  const { hide, position: [right, top] } = props;
  return (
    <Popup position={{ top, right }} hide={hide}>
      <div className={SPannel}>
      </div>
    </Popup>
  );
}

export function More() {
  const [popup, setPopup] = useState<[number, number] | null>(null);
  const hide = useCallback(() => setPopup(null), []);
  return <>
    <div
      className={SMore + (popup ? ' more-active' : '')}
      onClick={(ev) => {
        const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
        setPopup([window.innerWidth - rect.right, rect.bottom + 4]);
      }}
    >
      {icons.more}
    </div>
    {popup && (
      <Pannel position={popup} hide={hide} />
    )}
  </>
}
