import { css } from "@root/base/styled";
import { CSSProperties } from "react";
import ReactDOM from "react-dom";

const SOverlay = css`
  z-index: 1000000;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.2);
`;

const SContent = css`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(17, 31, 44, 0.12);
  box-shadow: rgba(0, 0, 0, 0.1) 1px 3px 8px 0px;
  background-color: rgb(255, 255, 255);
  border-radius: 4px;
  padding: 4px 0;
  min-width: 100px;
`;

const container = document.createElement('div');
document.body.append(container);
const NOOP = () => {};

function Modal(props: {
  style?: CSSProperties;
  className?: string;
  overlayBg?: string;
  hide?: () => void;
  children?: React.ReactNode;
}) {
  const { hide = NOOP, className, style, overlayBg, children } = props;

  let cls = SContent;
  if (className) cls += ' ' + className;

  return ReactDOM.createPortal(
    <div
      className={SOverlay}
      style={{ backgroundColor: overlayBg }}
      onClick={(e) => {
        e.stopPropagation();
        requestAnimationFrame(hide);
      }}>
      <div
        className={cls}
        style={style}
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    container,
  );
}


export default Modal;
