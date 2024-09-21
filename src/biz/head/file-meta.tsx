import { css } from "@root/base/styled";
import { useEffect, useRef, useState } from "react";
import ReactDOM from 'react-dom';


const SBox = css`
  display: flex;
  flex-direction: column;
`;
const STop = css`
  display: flex;
  align-items: center;
`;
const STitle = css`
  padding: 2px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 13px;
  &:hover {
    background-color: #ccc;
  }
`;

const SLastEdit = css`
  font-size: 11px;
  color: #999999;
`;

const SRename = css`
  z-index: 1000000;
  position: fixed;
  inset: 0;
  .rename-content {
    position: absolute;
    border: 1px solid rgba(17, 31, 44, 0.12);
    box-shadow: rgba(0, 0, 0, 0.1) 1px 3px 8px 0px;
    background-color: rgb(255, 255, 255);
    border-radius: 4px;
    padding: 12px;
    &>input {
      border: 1px solid #ccc;
      border-radius: 2px;
      padding: 4px 6px;
      min-width: 200px;
      &:focus {
        outline: none;
        box-shadow: rgba(0, 106, 254, 0.12) 0px 0px 0px 2px;
        border-color: rgba(63,133,255,1);
      }
    }
  }
`;

const container = document.createElement('div');
document.body.append(container);
function Rename(props: {
  position: [x: number, y: number];
  title: string;
  commit: (title: string) => void;
  hide: () => void;
}) {
  const { position: [left, top], title, commit, hide } = props;
  const [text, edit] = useState(title);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return ReactDOM.createPortal(
    <div
      className={SRename}
      onClick={() => requestAnimationFrame(hide)}>
      <div
        className="rename-content"
        style={{ left, top }}
        onClick={e => e.stopPropagation()}>
        <input
          value={text}
          ref={ref}
          onChange={e => edit(e.target.value)}
          onBlur={() => {
            if (text === title) return;
            commit(text);
          }}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            (e.target as HTMLInputElement).blur();
          }}
        />
      </div>
    </div>,
    container,
  );
}

export function FileMeta() {
  const [rename, setRename] = useState<[number, number] | null>(null);
  const [title, setTitle] = useState('Document Title');

  return (
    <div className={SBox}>
      <div className={STop}>
        <div
          className={STitle}
          onClick={(ev) => {
            const rect = (ev.target as HTMLElement).getBoundingClientRect();
            setRename([rect.left, rect.bottom]);
          }}
        >{title}</div>
      </div>
      {rename && (
        <Rename
          position={rename}
          title={title}
          commit={setTitle}
          hide={() => setRename(null)}
        />
      )}
      <div className={SLastEdit}>
        Last edit: {(new Date()).toLocaleString()}
      </div>
    </div>
  );
}
