import { css } from "@root/base/styled";
import { FileInfo } from "@root/model/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import icons from "../../components/icons";

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
  &:hover>.file-right {
    display: flex;
  }
`;

const SMore = css`
  width: 24px;
  height: 24px;
  padding: 4px;
  border-radius: 2px;
  &:hover, &.active {
    background-color: aliceblue;
  }
`;

function More() {
  return (
    <div className={SMore}>
      {icons.more}
    </div>
  );
}

export function File(props: {
  file: FileInfo;
  active?: boolean;
}) {
  const { file, active } = props;
  const { id, title = 'Untitled' } = file;
  const navigate = useNavigate();

  const open = () => navigate(`/edit/${id}`);
  return (
    <div
      className={SFile + (active ? ' active' : '')}
      onClick={open}
    >
      <div className="file-left">
        <div className="file-icon">{icons.mindmap}</div>
        <div className="file-title">{title}</div>
      </div>
      <div className="file-right" onClick={e => e.stopPropagation()}>
        <More />
      </div>
    </div>
  );
}

