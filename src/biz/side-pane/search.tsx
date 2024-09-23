import { css } from "@root/base/styled";
import { useMemo, useState } from "react";
import icons from "../components/icons";

const SBox = css`
  display: flex;
  align-items: center;

  background-color: rgba(23,26,29,0.04);
  border: 1px solid transparent;
  border-radius: 4px;
  margin: 8px 8px;
  padding: 4px 4px 4px 8px;
  gap: 4px;
  transition: 200ms;

  &:hover {
    border-color: rgba(63,133,255,1);
  }
  &:focus-within {
    box-shadow: rgba(0, 106, 254, 0.12) 0px 0px 0px 2px;
    border-color: rgba(63,133,255,1);
  }

  .search-icon {
    flex: 0 0 auto;
    display: block;
    height: 16px;
    width: 16px;
  }
  .search-input {
    flex: 1 1 100%;
    padding: 4px 6px;
    border: none;
    outline: none;
    background-color: transparent;

    &::placeholder {
      color: #ccc;
      font-weight: lighter;
    }
  }
`;


export function Search(props: {
  text: string;
  commit: (result: string) => void;
}) {
  const { commit, text } = props;
  const [value, setValue] = useState(text);

  const handle = useMemo(() => {
    let timer = 0;
    return (v: string) => {
      clearTimeout(timer);
      setValue(v);
      timer = window.setTimeout(() => commit(v), 200);
    };
  }, [commit, setValue]);

  return (
    <div className={SBox}>
      <span className="search-icon">{icons.search}</span>
      <input
        className="search-input"
        placeholder="Search files"
        value={value}
        onChange={(e) => {
          handle(e.target.value);
        }}
      />
    </div>
  );
}

