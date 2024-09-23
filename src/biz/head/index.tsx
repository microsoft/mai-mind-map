import { useAtom } from "@root/base/atom";
import { css } from "@root/base/styled"
import { Presenter } from "@root/components/icons/icons";
import { PresentationButton, presentationNodeFromSampleData } from "@root/components/presentation";
import { MindMapStateType } from "@root/components/state/mindMapState";
import icons from "../components/icons";
import { showSidepaneAtom } from "../store";
import { FileMeta } from "./file-meta";
import { Generate } from "./generate";
import { More } from "./more";
import { Share } from "./share";
import { Users } from "./users";

const SBox = css`
  border-bottom: 1px solid #eaeaea;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 0 12px;
  height: 50px;
`;

const SLeft = css`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;

  &>.fold-side {
    cursor: pointer;
    width: 18px;
    display: flex;
    align-items: center;
    transform: rotate(180deg);
  }
`;

const SRight = css`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
`;

const SHeadBtn = css`
  display: flex;
  align-items: center;
  padding: 3px 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  gap: 4px;
  cursor: pointer;
  &:hover {
    border-color: #2370ff;
  }
`;

interface HeadProps {
  treeState: MindMapStateType;
}

export function Header(props: HeadProps) {
  const { treeState } = props;
  const [sidepaneVisible, showSide] = useAtom(showSidepaneAtom);

  return (
    <div className={SBox}>
      <div className={SLeft}>
        {!sidepaneVisible && (
          <div className="fold-side" onClick={() => showSide(true)}>
            {icons.fold}
          </div>
        )}
        <FileMeta />
      </div>
      <div className={SRight}>
        <Users />
        <Generate className={SHeadBtn} />
        <PresentationButton
          rootNode={presentationNodeFromSampleData(treeState.mindMapData)}
          className={SHeadBtn}
        >
          <Presenter />
          <span>Presenter</span>
        </PresentationButton>
        <Share />
        <More />
      </div>
    </div>
  );
}
