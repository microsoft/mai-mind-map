import { useChange } from "@root/base/atom";
import { css } from "@root/base/styled";
import { filesAtom } from "@root/biz/store";
import { FileInfo } from "@root/model/api";
import { useEffect, useRef, useState } from "react";


const SRename = css`
  flex: 1 1 100%;
  border: 1px solid #ccc;
  border-radius: 2px;
  padding: 4px 6px;
  min-width: 200px;
  &:focus {
    outline: none;
    box-shadow: rgba(0, 106, 254, 0.12) 0px 0px 0px 2px;
    border-color: rgba(63,133,255,1);
  }
`;

export function Rename(props: {
  file: FileInfo;
  exit: VoidFunction;
}) {
  const { id, title = 'Untitled' } = props.file;
  const [text, edit] = useState(title);
  const ref = useRef<HTMLInputElement>(null);
  const actions = useChange(filesAtom)[1];

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <input
      className={SRename}
      value={text}
      ref={ref}
      onChange={e => edit(e.target.value)}
      onBlur={() => {
        if (text !== title) {
          actions.update(id, { title: text });
        }
        props.exit();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          props.exit();
        } else if (e.key === 'Enter') {
          (e.target as HTMLInputElement).blur();
        }
      }}
    />
  );
}

