import { useCallback, useState } from 'react';
import { Direction } from '../layout/flex-tree/hierarchy';
import { ColorMode, LinkMode } from './constants';

interface OptionStore {
  direction: Direction;
  scale: number;
  linkMode: LinkMode;
  colorMode: ColorMode;
}

const storeKey = 'mind_map_option';

const defaultOption: OptionStore = {
  direction: 'H',
  scale: 1,
  linkMode: LinkMode.HYBRID,
  colorMode: ColorMode.CUSTOM,
};
function loadOption(): OptionStore {
  let option: OptionStore = Object.assign({}, defaultOption);
  const optionBase64 = localStorage.getItem(storeKey);
  if (optionBase64) {
    try {
      option = JSON.parse(atob(optionBase64));
    } catch (e) {}
    if (
      option.direction &&
      option.scale &&
      option.linkMode &&
      option.colorMode
    ) {
      return option;
    }
    option = Object.assign({}, defaultOption);
    return option;
  }
  return option;
}

const optionStore = loadOption();
let direction = optionStore.direction;
let scaleValue = optionStore.scale;
let linkModeValue = optionStore.linkMode;
let colorModeValue = optionStore.colorMode;
function saveOption() {
  const option = {
    direction,
    scale: scaleValue,
    linkMode: linkModeValue,
    colorMode: colorModeValue,
  };
  localStorage.setItem(storeKey, btoa(JSON.stringify(option)));
}

export function useRenderOption() {
  const [dir, setDirFun] = useState<Direction>(direction);
  const [scale, setScaleFun] = useState(scaleValue);
  const [linkMode, setLinkModeFun] = useState(linkModeValue);
  const [colorMode, setColorModeFun] = useState(colorModeValue);
  const setDir = useCallback((dir: Direction) => {
    setDirFun(dir);
    direction = dir;
    saveOption();
  }, []);
  const setScale = useCallback((scale: number) => {
    setScaleFun(scale);
    scaleValue = scale;
    saveOption();
  }, []);
  const setLinkMode = useCallback((linkMode: LinkMode) => {
    setLinkModeFun(linkMode);
    linkModeValue = linkMode;
    saveOption();
  }, []);
  const setColorMode = useCallback((colorMode: ColorMode) => {
    setColorModeFun(colorMode);
    colorModeValue = colorMode;
    saveOption();
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
