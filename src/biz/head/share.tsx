import copyText from "@base/copy-text";
import { css } from "@root/base/styled";
import { useState } from "react";
import ReactDOM from "react-dom";
import icons from "../components/icons";

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
    </div>,
    container,
  );
}

export function Share() {
  const [pannelPos, setPanel] = useState<[number, number] | null>(null);
  return <>
    <div
      className={SShare + (pannelPos ? ' share-active' : '')}
      onClick={(ev) => {
        const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
        setPanel([window.innerWidth - rect.right, rect.bottom + 4]);
      }}
    >
      {icons.share}
    </div>
    {pannelPos && (
      <Pannel
        position={pannelPos}
        hide={() => setPanel(null)}
      />
    )}
  </>
}
