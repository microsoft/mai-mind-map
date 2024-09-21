import { Queue, queue } from './queue';

export type Observer<T> = (value: T) => void;
export type Unobserve = () => void;

type ObservableCore<T> = {
  peek(): T;
  observe(observer: Observer<T>): Unobserve;
  release(): void;
};

export type Observable<T> = ObservableCore<T> & {
  map<U>(f: (value: T) => U): Observable<U>;
  bind<U>(f: (value: T) => Observable<U>): Observable<U>;
};

export type Mutable<T> = Observable<T> & {
  update(updater: (value: T) => T): void;
};

function monadic<T>(ob: ObservableCore<T>): Observable<T> {
  function bind<U>(f: (valueT: T) => Observable<U>): Observable<U> {
    return observable<U>((update) => {
      const onInnerUpdate = (valueInner: U) => update(() => valueInner);
      const obInner = f(ob.peek());
      let unobInner = obInner.observe(onInnerUpdate);
      const unobOuter = ob.observe((valueOuter: T) => {
        unobInner();
        const obInnerT = f(valueOuter);
        unobInner = obInnerT.observe(onInnerUpdate);
        onInnerUpdate(obInnerT.peek());
      });
      return [
        obInner.peek(),
        () => {
          unobInner();
          unobOuter();
        },
      ];
    });
  }

  return { ...ob, bind, map: (f) => bind((valueT) => pure(f(valueT))) };
}

export function mutable<T>(
  initValue: T,
  release: () => void = () => {},
): Mutable<T> {
  let value = initValue;
  const observers: Queue<Observer<T>> = queue();

  return {
    ...monadic({
      peek: () => value,
      observe: observers.enqueue,
      release,
    }),
    update(updater) {
      const newValue = updater(value);
      if (newValue !== value) {
        value = newValue;
        // biome-ignore lint/complexity/noForEach: <explanation>
        observers.toArray().forEach((observer) => observer(newValue));
      }
    },
  };
}

export function observable<T>(
  init: (update: (updater: (value: T) => T) => void) => [T, () => void],
): Observable<T> {
  const updateT = (updater: (value: T) => T) => update(updater);
  const [initValue, release] = init(updateT);
  const { peek, observe, update, map, bind } = mutable<T>(initValue, release);
  return { peek, observe, map, bind, release };
}

export function pure<T>(value: T): Observable<T> {
  return monadic({
    peek: () => value,
    observe: () => () => {},
    release: () => {},
  });
}

type Observables<T extends any[]> = {
  [K in keyof T]: Observable<T[K]>;
};

export function apply<F extends (...any: any[]) => any>(
  f: F,
  ...args: Observables<Parameters<F>>
): Observable<ReturnType<F>> {
  if (args.length === 0) return pure(f());
  const [argHead, ...argsTail] = args;
  return argHead.bind((value) =>
    apply((...argsN: any[]) => f(value, ...argsN), ...argsTail),
  );
}

export function compareAndUpdate<T>(
  value: T,
  equal: (valueA: T, valueB: T) => boolean,
) {
  return (curValue: T) => (equal(curValue, value) ? curValue : value);
}
