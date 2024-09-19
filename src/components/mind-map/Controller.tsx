import { css } from '@base/styled';
import { TreeViewControllerPortal } from '@root/components/state/mindMapState';
import { FC, Fragment, useContext } from 'react';
import { createPortal } from 'react-dom';
import { LayoutControl } from './LayoutControl';
import { ScaleControl } from './ScaleControl';
import { Direction } from './render';

interface ControllerProps {
  dir: Direction;
  serDir: (dir: Direction) => void;
  scale: number;
  setScale: (scale: number) => void;
}

export const STreeViewController = css``;

export const Controller: FC<ControllerProps> = (props) => {
  const { dir, serDir, scale, setScale } = props;
  const portal = useContext(TreeViewControllerPortal);
  return portal
    ? createPortal(
        <Fragment>
          <LayoutControl direction={dir} setDirection={serDir} />
          <ScaleControl min={0.2} max={5} scale={scale} setScale={setScale} />
        </Fragment>,
        portal,
      )
    : null;
};
