export function getSizeFromNodeDate(elId: string): [number, number] {
  const el = document.getElementById(elId);
  if (el) {
    return [el.offsetWidth, el.offsetHeight];
  }
  return [50, 30];
}
