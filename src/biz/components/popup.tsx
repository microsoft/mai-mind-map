import { css } from "@root/base/styled";
import { useEffect } from "react";
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
`;

const container = document.createElement('div');
document.body.append(container);
container.addEventListener('click', e => e.stopPropagation());

export interface PopupPosition {
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
}

function check(target: HTMLElement, self: HTMLElement) {
  let node: HTMLElement | null = target;
  while (node) {
    if (node === self) return true;
    node = node.parentElement;
  }
  return false;
}

// there may be some bugs of react
function bind(call: VoidFunction) {
  let flag = false;
  const timer = window.setTimeout(() => {
    document.addEventListener('click', call);
    flag = true;
  }, 50);
  return () => {
    if (flag) document.removeEventListener('click', call);
    else window.clearTimeout(timer);
  };
}

const NOOP = () => {};
function Popup(props: {
  position: PopupPosition;
  hide?: () => void;
  children?: React.ReactNode;
}) {
  const { position, hide = NOOP, children } = props;
  useEffect(() => bind(hide), []);

  return ReactDOM.createPortal(
    <div
      className={SPopup}
      style={position}
      onClick={e => e.stopPropagation()}>
      {children}
    </div>,
    container,
  );
}


export default Popup;
