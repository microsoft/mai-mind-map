import { useChange } from "@root/base/atom";
import copyTextToClipboard from "@root/base/copy-text";
import { css } from "@root/base/styled";
import Modal from "@root/biz/components/modal";
import { filesAtom } from "@root/biz/store";
import { FileInfo } from "@root/model/api";
import { useNavigate } from "react-router-dom";
import icons from "../../components/icons";

const SMenu = css`
  &>div {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    width: 160px;
    cursor: pointer;
    &:hover {
      background-color: #f2f2f2;
    }
    &>svg {
      flex: 0 0 20px
    }
    &>span {
      flex: 1 1 100%;
      font-size: 14px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
`;
const SDelete = css`
  padding: 8px 20px;
  h2 {
    all: unset;
    display: block;
    font-size: 20px;
    font-weight: 500;
    text-align: center;
  }
  div {
    margin-top: 12px;
    display: flex;
    gap: 20px;
    justify-content: center;
    button {
      padding: 8px 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: transparent;
      cursor: pointer;
      &:hover {
        border-color: #2370ff;
        background-color: #2370ff;
        color: white;
      }
    }
  }
`;

export interface MenuProps {
  file: FileInfo;
  rename: VoidFunction;
}

export function Menu(props: MenuProps) {
  const { file, rename } = props;
  const actions = useChange(filesAtom)[1];
  const navigate = useNavigate();

  function copy() {
    copyTextToClipboard(`${location.origin}/edit/${file.id}`)
      .then(() => {
        const hide = Modal.show(
          <div style={{ padding: '10px 20px' }}>
            Added to clipboard
          </div>
        );
        setTimeout(hide, 1500);
      });
  }

  function remove() {
    const hide = Modal.show(
      <div className={SDelete}>
        <h2>Confirm Delete</h2>
        <div>
          <button onClick={() => hide()}>Cancel</button>
          <button onClick={() => {
            actions.remove(file.id).then((next) => {
              if (!next) return;
              navigate(`/edit/${next.id}${location.search}`);
            }).finally(hide);
          }}>Delete</button>
        </div>
      </div>
    );
  }

  return (
    <div className={SMenu}>
      <div onClick={() => window.open(`/edit/${file.id}`, '_blank')}>
        {icons.openInNewTab}
        <span>Open in new tab</span>
      </div>
      <div onClick={copy}>
        {icons.link}
        <span>Copy link</span>
      </div>
      <div onClick={rename}>
        {icons.rename}
        <span>Rename</span>
      </div>
      <div onClick={remove}>
        {icons.remove}
        <span>Delete</span>
      </div>
    </div>
  );
}
