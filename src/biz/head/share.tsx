import clsnames from "@base/classnames";
import copyText from "@base/copy-text";
import { css } from "@root/base/styled";
import { useCallback, useState } from "react";
import icons from "../components/icons";
import Popup from "../components/popup";

const SShare = css`
  display: flex;
  align-items: center;
  height: 28px;
  width: 28px;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;

  &:hover, &.share-active {
    background-color: rgba(0,0,0,0.04);
  }
`;
const SPopup = css`
  padding: 12px 16px;
  width: 420px;
  h1 {
    all: unset;
    font-size: 18px;
    font-weight: 500;
  }
  .share-url {
    margin: 12px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #828282;
    border: 1px solid #ececec;
    border-radius: 4px;
    background-color: #eef1f4;
    padding: 4px 8px;
  }
  .share-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .share-desc {
      font-size: 14px;
      color: #555555;
    }
  }
  .share-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;

    button {
      padding: 6px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: transparent;
      cursor: pointer;
      &:hover {
        border-color: #2370ff;
        background-color: #2370ff;
        color: white !important;
      }
    }
  }
`;

function Pannel(props: {
  position: [x: number, y: number];
  hide: () => void;
}) {
  const { hide, position: [right, top] } = props;

  return (
    <Popup position={{ right, top }} hide={hide}>
      <div className={SPopup}>
        <h1>Share this file</h1>
        <div className="share-url">{location.href}</div>
        <div className="share-bottom">
          <div className="share-desc">Copy url to anyone</div>
          <div className="share-actions">
            <button
              style={{ color: '#2370ff' }}
              onClick={() => {
                copyText(location.href);
                hide();
              }}
            >
              Copy
            </button>
            <button onClick={hide}>Cancel</button>
          </div>
        </div>
      </div>
    </Popup>
  );
}

export function Share() {
  const [popup, setPopup] = useState<[number, number] | null>(null);
  const hide = useCallback(() => setPopup(null), []);
  return <>
    <div
      className={clsnames(SShare, popup && 'share-active')}
      onClick={(ev) => {
        const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
        setPopup([window.innerWidth - rect.right, rect.bottom + 4]);
      }}
    >
      {icons.share}
    </div>
    {popup && (
      <Pannel position={popup} hide={hide} />
    )}
  </>;
}
