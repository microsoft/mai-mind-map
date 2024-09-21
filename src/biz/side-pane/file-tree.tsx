import { css } from "@root/base/styled";
import { useEffect, useState } from "react";
import icons from "../components/icons";


const SBox = css`
  padding: 8px;
`;
const SHead = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 16px;
  .head-left {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 16px;
    &>svg {
      width: 18px;
    }
  }
  .head-right {
    .add-new-file {
      display: flex;
      align-items: center;
      padding: 4px;
      border-radius: 4px;
      cursor: pointer;
      &:hover {
        background-color: #ebebeb;
      }
      &>svg {
        width: 18px;
      }
    }
  }
`;
const SItem = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 20px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: rgba(0,0,0,0.04);
  }
  .file-icon {
    flex: 0 0 auto;
    width: 16px;
    display: flex;
    align-items: center;
  }
  .file-title {
    flex: 1 1 auto;
  }
`;

interface DocInfo {
  created: string;
  updated: string;
  id: string;
  title?: string;
}

export function useDocLsit() {
  const [docs, setDocs] = useState<DocInfo[]>([]);
  useEffect(() => {
    fetch('/api/list')
      .then((r) => r.json())
      .then(r => setDocs(r.list));
  }, []);
  return docs;
}

export function FileTree(props: {
  docs: DocInfo[];
}) {
  const { docs } = props;
  return (
    <div className={SBox}>
      <div className={SHead}>
        <div className="head-left">
          {icons.catalog}
          <span>Catalog</span>
        </div>
        <div className="head-right">
          <div className="add-new-file">{icons.add}</div>
        </div>
      </div>
      <div>
        {docs.map((d) => {
          return (
            <div key={d.id} className={SItem}>
              <div className="file-icon">{icons.mindmap}</div>
              <div className="file-title">{d.title || 'Untitled'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
