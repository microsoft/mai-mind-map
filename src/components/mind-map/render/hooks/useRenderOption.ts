import { useCallback, useState } from 'react';
import { Direction } from '../layout/flex-tree/hierarchy';
import { ColorMode, LinkMode } from './constants';

let direction: Direction = 'H';
let scaleValue = 1;
let linkModeValue: LinkMode = LinkMode.HYBRID;
let colorModeValue: ColorMode = ColorMode.DEFAULT;

export function useRenderOption() {
  const [dir, setDirFun] = useState<Direction>(direction);
  const [scale, setScaleFun] = useState(scaleValue);
  const [linkMode, setLinkModeFun] = useState(linkModeValue);
  const [colorMode, setColorModeFun] = useState(colorModeValue);
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
  const setColorMode = useCallback((colorMode: ColorMode) => {
    setColorModeFun(colorMode);
    colorModeValue = colorMode;
  }, []);

  return {
    dir,
    setDir,
    scale,
    setScale,
    linkMode,
    setLinkMode,
    colorMode,
    setColorMode,
  };
}
