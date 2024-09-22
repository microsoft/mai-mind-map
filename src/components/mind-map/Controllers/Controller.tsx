import { css } from '@base/styled';
import { atom, useAtom, useChange } from '@root/base/atom';
import { FC, Fragment, useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Direction } from '../render';
import { ColorMode, LinkMode } from '../render/hooks/constants';
import { ColorModeControl } from './ColorControl';
import { LayoutControl } from './LayoutControl';
import { LinkModeControl } from './LinkModeControl';
import { ScaleControl } from './ScaleControl';

interface ControllerProps {
  dir: Direction;
  serDir: (dir: Direction) => void;
  scale: number;
  setScale: (scale: number) => void;
  linkMode: LinkMode;
  setLinkMode: (linkMode: LinkMode) => void;
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
}

export const STreeViewController = css``;

const controllerPortalAtom = atom<HTMLDivElement | null>(null);

export function ControllerMountDiv(props: { className?: string }) {
  const setPortal = useChange(controllerPortalAtom);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    setPortal(ref.current);
    return () => setPortal(null);
  }, []);
  const cls = props.className ? `${STreeViewController} ${props.className}` : STreeViewController;
  return <div className={cls} ref={ref} />;
};

export const Controller: FC<ControllerProps> = (props) => {
  const { dir, serDir, scale, setScale } = props;
  const portal = useAtom(controllerPortalAtom)[0];
  return portal
    ? createPortal(
        <Fragment>
          <LayoutControl direction={dir} setDirection={serDir} />
          <LinkModeControl
            linkMode={props.linkMode}
            setLinkMode={props.setLinkMode}
          />
          <ColorModeControl
            colorMode={props.colorMode}
            setColorMode={props.setColorMode}
          />
          <ScaleControl min={0.2} max={5} scale={scale} setScale={setScale} />
        </Fragment>,
        portal,
      )
    : null;
};
