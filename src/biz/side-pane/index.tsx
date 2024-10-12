import { useAtom } from "@root/base/atom";
import { css } from "@root/base/styled"
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  &>div {
    flex: 0 0 auto;
  }
`;

export function SidePane() {
  const [{ files, loading }, ,actions] = useAtom(filesAtom);
  const [sidepaneVisible, showSide] = useAtom(showSidepaneAtom);
  const [filter, setFilter] = useState('');
  const { fileId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    actions.fetchFilesOnce(navigate, fileId);
  }, []);

  if (!sidepaneVisible) return;

  const filteredFiles = filter
    ? files.filter(({ id, title = 'Untitled' }) => {
      if (id === fileId) return true;
      return title.toLocaleLowerCase().includes(filter.toLocaleLowerCase());
    })
    : files;

  return (
    <div className={SBox} style={{ overflowY: 'auto' }}>
      <SideHead showSide={showSide} />
      <Search text={filter} commit={setFilter} />
      <FileTree files={filteredFiles} loading={loading} />
    </div>
  );
}
