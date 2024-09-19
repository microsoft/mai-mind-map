import { useEffect, useState } from "react";
import { Mutable, Observable } from "@root/model/observable";

export function useMutable<T>(mut: Mutable<T>): [T, (updater: (value: T) => T) => void] {
  const [value, setValue] = useState<T>(mut.peek());
  useEffect(() => {
    setValue(mut.peek());
    return mut.observe(setValue);
  }, [mut, setValue]);
  return [value, mut.update];
}

export function useObservable<T>(ob: Observable<T>): T {
  const [value, setValue] = useState<T>(ob.peek());
  useEffect(() => {
    setValue(ob.peek());
    return ob.observe(setValue);
  }, [ob, setValue]);
  return value;
}