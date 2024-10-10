import { css } from "@root/base/styled";
import Popup, { PopupPosition } from "@root/biz/components/popup";
import { FileInfo } from "@root/model/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import icons from "../../components/icons";
import { Menu, MenuProps } from "./menu";
import { Rename } from "./rename";

const SFile = css`
  display: flex;
  align-items: center;
  height: 32px;
  padding: 6px 6px 6px 20px;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  &:hover, &.active {
    background-color: rgba(0,0,0,0.04);
  }
  &+& {
    margin-top: 1px;
  }

  .file-left {
    flex: 1 1 100%;
    display: flex;
    gap: 8px;
    overflow: hidden;
    .file-icon {
      width: 16px;
      display: flex;
      align-items: center;
    }
    .file-title {
      flex: 1 1 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .file-right {
    flex: 0 0 auto;
    display: none;
    align-items: center;
  }
  &:hover>.file-right, .file-right.active {
    display: flex;
  }
`;
const SMore = css`
  width: 24px;
  height: 24px;
  padding: 4px;
  border-radius: 2px;
  &:hover, &.active {
    background-color: #e4e4e4;
  }
`;

function bindActive(flag: boolean, base: string) {
  return flag ? (base + ' active') : base;
}

function Actions(props: MenuProps) {
  const [morePosition, setPos] = useState<PopupPosition | null>(null);
  const active = Boolean(morePosition)

  return (
    <div className={bindActive(active, 'file-right')} onClick={e => e.stopPropagation()}>
      <div
        className={bindActive(active, SMore)}
        onClick={(ev) => {
          if (morePosition) return;
          const { x, bottom } = (ev.currentTarget).getBoundingClientRect();
          setPos({ left: x, top: bottom + 4 });
        }}
      >
        {icons.more}
      </div>
      {morePosition && (
        <Popup position={morePosition} hide={() => setPos(null)}>
          <Menu {...props} />
        </Popup>
      )}
    </div>
  );
}

export function File(props: {
  file: FileInfo;
  active?: boolean;
}) {
  const { file, active } = props;
  const { id, title = 'Untitled' } = file;
  const [renameing, setRename] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className={SFile + (active ? ' active' : '')}
      onClick={() => navigate(`/edit/${id}${location.search}`)}
    >
      <div className="file-left">
        <div className="file-icon">{icons.mindmap}</div>
        {renameing ? (
          <Rename file={file} exit={() => setRename(false)} />
        ) : (
          <div className="file-title">{title}</div>
        )}
      </div>
      {!renameing && (
        <Actions file={file} rename={() => setRename(true)} />
      )}
    </div>
  );
}

