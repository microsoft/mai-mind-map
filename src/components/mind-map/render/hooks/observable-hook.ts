import { Mutable, Observable } from '@root/model/observable';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

export function useMutable<T>(
  mut: Mutable<T>,
): [T, (updater: (value: T) => T) => void] {
  const [value, setValue] = useState<T>(mut.peek());
  useEffect(() => {
    setValue(mut.peek());
    return mut.observe(setValue);
  }, [mut]);
  return [value, mut.update];
}

export function useObservable<T>(ob: Observable<T>): T {
  const [value, setValue] = useState<T>(ob.peek());
  const debouncedSetValue: React.Dispatch<React.SetStateAction<T>> =
    useCallback(debounce(setValue, 1), []);
  useEffect(() => {
    setValue(ob.peek());
    return ob.observe(debouncedSetValue);
  }, [ob, debouncedSetValue]);
  return value;
}
