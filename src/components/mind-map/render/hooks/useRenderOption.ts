import { useCallback, useEffect, useState } from 'react';
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
  colorMode: ColorMode.COLORFUL,
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
  const [dir, setDir] = useState<Direction>(direction);
  const [scale, setScale] = useState(scaleValue);
  const [linkMode, setLinkMode] = useState(linkModeValue);
  const [colorMode, setColorMode] = useState(colorModeValue);

  useEffect(() => {
    direction = dir;
    saveOption();
  }, [dir]);
  useEffect(() => {
    scaleValue = scale;
    saveOption();
  }, [scale]);
  useEffect(() => {
    linkModeValue = linkMode;
    saveOption();
  }, [linkMode]);
  useEffect(() => {
    colorModeValue = colorMode;
    saveOption();
  }, [colorMode]);

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
