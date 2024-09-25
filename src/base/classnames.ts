type StrMap = { [cls: string]: boolean | null | undefined };
type Plain = string | boolean | null | undefined;
type StrArr = Array<Plain | StrMap | StrArr>;

function concact(list: StrArr): string {
  const res: string[] = [];
  for (const item of list) {
    if (Array.isArray(item)) {
      const s = concact(item);
      if (s) res.push(s);
    } else if (typeof item === 'object') {
      for (const key in item) {
        if (item[key]) res.push(key);
      }
    } else if (typeof item === 'string') {
      if (item) res.push(item);
    }
  }
  return res.join(' ');
}

export default function (...args: StrArr): string {
  return concact(args);
}
