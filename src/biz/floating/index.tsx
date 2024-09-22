import { useAtom } from "@root/base/atom";
import { css } from "@root/base/styled";
import icons from "../components/icons";
import { viewModeAtom } from "../store";
import { MindMapTheme } from "./mindmap-theme";

const SBox = css`
  position: absolute;
  left: 20px;
  top: 20px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
`;
const SToolBox = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 42px;
  padding: 6px 0;
  background-color: white;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: rgba(0, 16, 32, 0.2) 0px 0px 1px 0px, rgba(0, 16, 32, 0.12) 0px 4px 24px 0px;
`;
const STool = css`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 28px;
  width: 28px;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  &:hover, &.active {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

function MindMapViewTools() {
  return (
    <>
      <MindMapTheme className={STool} />
      <div className={STool}>{icons.comment}</div>
      <div className={STool}>{icons.move}</div>
      <div className={STool}>{icons.focus}</div>
    </>
  );
}

function OutlineViewTools() {
  // Todo: add more tool in the future
  return (
    <>
      <div className={STool}>{icons.comment}</div>
    </>
  );
}

export function FloatingTools() {
  const [view, , viewActions] = useAtom(viewModeAtom);

  const isMindmap = view === 'mindmap';
  const isOutline = view === 'outline';

  return (
    <div className={SBox}>
      <div className={SToolBox}>
        <div
          className={STool + (isMindmap ? ' active' : '')}
          onClick={() => viewActions.showMindmap()}
        >
          {icons.mindmapView}
        </div>
        <div
          className={STool + (isOutline ? ' active' : '')}
          onClick={() => viewActions.showOutline()}
        >
          {icons.outlineView}
        </div>
      </div>

      <div className={SToolBox}>
        {isMindmap ? <MindMapViewTools /> : <OutlineViewTools />}
      </div>
    </div>
  );
}
