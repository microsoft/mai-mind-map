import { css } from "@root/base/styled";
import { FileInfo } from "@root/model/api";
import { useNavigate, useParams } from "react-router-dom";
import icons from "../components/icons";
import { StepLoadingStyle } from "../components/step-loading";


const SBox = css`
  padding: 8px;
`;
const SLoadPlace = css`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
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
const SFile = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 20px;
  cursor: pointer;
  font-size: 14px;
  &:hover, &.active {
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

export function FileTree(props: {
  files: FileInfo[];
  loading: boolean;
}) {
  const { files, loading } = props;
  const navigate = useNavigate();
  const { fileId } = useParams();

  if (loading) {
    return (
      <div className={SLoadPlace}>
        <div className={StepLoadingStyle}/>
      </div>
    );
  }

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
        {files.map((d) => {
          const open = () => navigate(`/edit/${d.id}`);
          const active = d.id === fileId;
          return (
            <div
              key={d.id}
              className={SFile + (active ? ' active' : '')}
              onClick={open}>
              <div className="file-icon">{icons.mindmap}</div>
              <div className="file-title">{d.title || 'Untitled'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
