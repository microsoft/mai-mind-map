import { useCallback, useState } from 'react';
import { Direction } from '../layout/flex-tree/hierarchy';
import { LinkMode } from './constants';

let direction: Direction = 'V';
let scaleValue = 1;
let linkModeValue: LinkMode = LinkMode.HYBRID;

export function useRenderOption() {
  const [dir, setDirFun] = useState<Direction>(direction);
  const [scale, setScaleFun] = useState(scaleValue);
  const [linkMode, setLinkModeFun] = useState(linkModeValue);
  const setDir = useCallback((dir: Direction) => {
    setDirFun(dir);
    direction = dir;
  }, []);
  const setScale = useCallback((scale: number) => {
    setScaleFun(scale);
    scaleValue = scale;
  }, []);
  const setLinkMode = useCallback((linkMode: LinkMode) => {
    setLinkModeFun(linkMode);
    linkModeValue = linkMode;
  }, []);

  return {
    dir,
    setDir,
    scale,
    setScale,
    linkMode,
    setLinkMode,
  };
}
