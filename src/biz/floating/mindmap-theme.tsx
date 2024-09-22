import { css } from "@root/base/styled";
import { ControllerMountDiv } from "@root/components/mind-map/Controllers/Controller";
import { useEffect, useRef, useState } from "react";
import icons from "../components/icons";

const SPanel = css`
  position: absolute;
  top: -7px;
  left: 42px;
  padding: 12px 16px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: rgba(0, 16, 32, 0.2) 0px 0px 1px 0px, rgba(0, 16, 32, 0.12) 0px 4px 24px 0px;
`;


export function MindMapTheme(props: { className?: string }) {
  const { className } = props;
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current!;
    let timer = 0;
    const show = () => {
      clearTimeout(timer);
      setActive(true);
    };
    const hide = () => {
      timer = window.setTimeout(() => setActive(false), 100);
    };
    el.addEventListener('mouseenter', show);
    el.addEventListener('mouseleave', hide);
    return () => {
      el.removeEventListener('mouseenter', show);
      el.removeEventListener('mouseleave', hide);
    };
  }, []);

  return (
    <div
      className={className + (active ? ' active' : '')}
      style={{ position: 'relative' }}
      ref={ref}
    >
      {icons.theme}
      {active && (
        <div className={SPanel}>
          <ControllerMountDiv />
        </div>
      )}
    </div>
  );
}
