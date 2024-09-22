import { css } from '@base/styled';
import { TreeViewControllerPortal } from '@root/components/state/mindMapState';
import { FC, Fragment, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Direction } from '../render';
import { LinkMode } from '../render/hooks/constants';
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
}

export const STreeViewController = css``;

export const Controller: FC<ControllerProps> = (props) => {
  const { dir, serDir, scale, setScale } = props;
  const portal = useContext(TreeViewControllerPortal);
  return portal
    ? createPortal(
        <Fragment>
          <LayoutControl direction={dir} setDirection={serDir} />
          <LinkModeControl
            linkMode={props.linkMode}
            setLinkMode={props.setLinkMode}
          />
          <ScaleControl min={0.2} max={5} scale={scale} setScale={setScale} />
        </Fragment>,
        portal,
      )
    : null;
};
