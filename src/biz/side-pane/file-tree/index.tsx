import { css } from "@root/base/styled";
import { LoadingVeiw } from "@root/components/LoadingView";
import { FileInfo } from "@root/model/api";
import { useNavigate, useParams } from "react-router-dom";
import icons from "../../components/icons";
import { File } from "./file";


const SBox = css`
  padding: 8px;
  flex: 1 1 100% !important;
  overflow: hidden;

  display: flex;
  flex-direction: column;
`;

const SLoadPlace = css`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const SHead = css`
  flex: 0 0 auto;
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
const SBody = css`
  flex: 1 1 auto;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 25px;
  }
  &:hover::-webkit-scrollbar-thumb {
    background: #c9c9c9;
  }
`;


export function FileTree(props: {
  files: FileInfo[];
  loading: boolean;
}) {
  const { files, loading } = props;
  const { fileId } = useParams();
  const navigate = useNavigate();

  if (loading) {
    return <LoadingVeiw />;
  }

  return (
    <div className={SBox}>
      <div className={SHead}>
        <div className="head-left">
          {icons.catalog}
          <span>Catalog</span>
        </div>
        <div className="head-right">
          <div className="add-new-file" onClick={() => navigate(`/edit`)}>{icons.add}</div>
        </div>
      </div>
      <div className={SBody}>
        {files.map((f) => {
          const active = f.id === fileId;
          return <File key={f.id} active={active} file={f} />;
        })}
      </div>
    </div>
  );
}
