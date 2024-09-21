export type Read<T> = (v: unknown) => T;

export const readPrime =
  <T>(dft: T) : Read<T> => (v) => typeof v === typeof dft ? (v as T) : dft;

export const readString = readPrime('');
export const readNumber = readPrime(0);
export const readBoolean = readPrime(false);

type ReadStt<T extends Record<string, any>> = {
  [K in keyof T]: Read<T[K] | undefined>;
};

export const readStruct =
  <T extends Record<string, any>>(readStt: ReadStt<T>): Read<T | undefined> =>
  (v) =>
    typeof v === "object" && v
      ? Object.keys(readStt).reduce((m: T | undefined, key: keyof T) => {
          if (m) {
            const value = readStt[key]((v as Record<keyof T, unknown>)[key]);
            if (value === undefined) return;
            m[key] = value;
          }
          return m;
        }, {} as T)
      : undefined;

export const readPartial = 
  <T extends Record<string, any>>(readStt: ReadStt<T>): Read<Partial<T>> =>
  (v) =>
    typeof v === "object" && v
      ? Object.keys(readStt).reduce((m: Partial<T>, key: keyof T) => {
          const value = readStt[key]((v as Record<keyof T, unknown>)[key]);
          if (value !== undefined) m[key] = value;
          return m;
        }, {} as Partial<T>)
      : {};

export const readRecord =
  <T>(read: Read<T | undefined>): Read<Record<string, T>> =>
  (v) =>
    typeof v === "object" && v
      ? Object.keys(v).reduce((m, key) => {
        const value = read((v as Record<string, unknown>)[key]);
        if (value !== undefined) m[key] = value;
        return m;
      }, {} as Record<string, T>)
      : {};

export const readArray =
  <T>(read: Read<T | undefined>): Read<T[]> =>
  (v) =>
    Array.isArray(v)
      ? v.reduce((m, elem: unknown) => {
          const value = read(elem);
          if (value !== undefined) m.push(value);
          return m;
        }, [] as T[])
      : [];
