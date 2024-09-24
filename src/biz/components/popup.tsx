import { css } from "@root/base/styled";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const SPopup = css`
  position: absolute;
  z-index: 1000;
  border: 1px solid rgba(23,26,29,0.14);
  box-shadow: 0 3px 6px -4px rgba(0,0,0,.12),0 6px 16px 0 rgba(0,0,0,.08),0 9px 28px 8px rgba(0,0,0,.05);
  background-color: rgb(255, 255, 255);
  border-radius: 4px;
  padding: 4px 0;
  min-width: 100px;
  transition: 200ms;
  transform-origin: top;
`;

const SAnimStart = css`
  transform: translateY(-4px) scaleY(0.9);
  opacity: 0;
`;

const container = document.createElement('div');
document.body.append(container);

export interface PopupPosition {
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
}

function contain(self: HTMLElement, target: HTMLElement) {
  let node: HTMLElement | null = target;
  while (node) {
    if (node === self) return true;
    node = node.parentElement;
  }
  return false;
}

function bind(call: VoidFunction) {
  function handle(e: MouseEvent) {
    if (contain(container, e.target as HTMLElement)) return;
    window.requestAnimationFrame(call);
  }
  // use capture to avoid bubble bug
  document.addEventListener('click', handle, true);
  return () => document.removeEventListener('click', handle, true);
}

const NOOP = () => {};
function Popup(props: {
  position: PopupPosition;
  hide?: () => void;
  children?: React.ReactNode;
}) {
  const { position, hide = NOOP, children } = props;
  const [cls, setCls] = useState(`${SPopup} ${SAnimStart}`);
  useEffect(() => {
    setCls(SPopup);
    return bind(hide);
  }, []);

  return ReactDOM.createPortal(
    <div
      className={cls}
      style={position}
      onClick={e => e.stopPropagation()}>
      {children}
    </div>,
    container,
  );
}


export default Popup;
