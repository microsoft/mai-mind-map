import { Payload } from '../model/index';

export function getSizeFromNodeDate(data: Payload): [number, number] {
  if (data.cachedWidth && data.cachedHeight) {
    return [data.cachedWidth, data.cachedHeight];
  }
  return [50, 50];
}
