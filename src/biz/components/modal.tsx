import classnames from "@base/classnames";
import { css } from "@base/styled";
import { CSSProperties, createElement, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

const Duration = 100;

const SOverlay = css`
  z-index: 1000000;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.2);
  transition: ${Duration}ms;
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
  transition: ${Duration}ms;
`;

const SOverlayInit = css`
  opacity: 0;
`;

const SContentInit = css`
  opacity: 0;
  transform: translate(-50%, calc(-50% - 8px));
`;

const container = document.createElement('div');
document.body.append(container);
const NOOP = () => {};

interface Props {
  style?: CSSProperties;
  className?: string;
  overlayBg?: string;
  hide?: () => void;
  children?: React.ReactNode;
}

function Content(props: Props) {
  const { hide = NOOP, className, style, overlayBg, children } = props;
  const [anime, setAnime] = useState(2);

  useEffect(() => {
    setAnime(1);
    const timer = window.setTimeout(() => setAnime(0), Duration);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      className={classnames(SOverlay, anime > 1 && SOverlayInit)}
      style={{ backgroundColor: overlayBg }}
      onClick={(e) => {
        e.stopPropagation();
        requestAnimationFrame(hide);
      }}>
      <div
        className={classnames(SContent, className, anime > 0 && SContentInit)}
        style={style}
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function Modal(props: Props) {
  return ReactDOM.createPortal(
    createElement(Content, props),
    container,
  );
}

function show(children: React.ReactNode) {
  const root = createRoot(container);
  const hide = () => root.unmount();
  root.render(
    <Content hide={hide}>{children}</Content>
  );
  return hide;
}

Modal.show = show;

export default Modal;
