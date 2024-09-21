import { css } from "@root/base/styled";
import icons from "../components/icons";
import { SideHome } from "./home";

const SBox = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  height: 50px;

  &>.fold-side {
    cursor: pointer;
    width: 18px;
    display: flex;
    align-items: center;
  }
`;
const SLeft = css`
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  font-size: 14px;
  font-weight: bold;
`;

export function SideHead(props: {
  showSide: (v: boolean) => void;
}) {
  const { showSide } = props;

  return (
    <div className={SBox}>
      <div className={SLeft}>
        <SideHome />
        <span>Ms Mind Map</span>
      </div>
      <div className="fold-side" onClick={() => showSide(false)}>
        {icons.fold}
      </div>
    </div>
  );
}
