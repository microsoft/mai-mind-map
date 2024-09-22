import { useAtom } from "@root/base/atom";
import { css } from "@root/base/styled"
import { useEffect } from "react";
import { filesAtom, showSidepaneAtom } from "../store";
import { FileTree } from "./file-tree";
import { SideHead } from "./head";
import { Search } from "./search";

const SBox = css`
  width: 300px;
  height: 100%;
  border-right: 1px solid #eaeaea;
  display: flex;
  flex-direction: column;
  background-color: rgba(250,251,251,1);
`;

export function SidePane() {
  const [{ files, loading }, ,actions] = useAtom(filesAtom);
  useEffect(actions.fetchFilesOnce, []);
  const [sidepaneVisible, showSide] = useAtom(showSidepaneAtom);

  if (!sidepaneVisible) return;
  return (
    <div className={SBox}>
      <SideHead showSide={showSide} />
      <Search />
      <FileTree files={files} loading={loading} />
    </div>
  );
}
