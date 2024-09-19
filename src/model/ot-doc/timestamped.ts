import { $Eq, $Ord, $eqPrime, $ordPrime } from './algebra';
import { $FullDoc, $Init, $init } from './document';
import { $fullDocGww, Update } from './singleton';

// t: timestamp
// v: value
export type Timestamped<T> = { t: number; v: T };

export const $eqTimestamped = <T>({ equals }: $Eq<T>): $Eq<Timestamped<T>> => ({
  equals: (a) => (b) => a.t === b.t && equals(a.v)(b.v),
});

export const $ordTimestamped = <T>({
  lessThan,
}: $Ord<T>): $Ord<Timestamped<T>> => ({
  lessThan: (a) => (b) => a.t < b.t || (a.t === b.t && lessThan(a.v)(b.v)),
});

export const $fullDocLww = <A>(
  cls: $Eq<A> & $Init<A> & $Ord<A>,
): $FullDoc<Timestamped<A>, Update<Timestamped<A>>> =>
  $fullDocGww({
    ...$init({ t: Number.POSITIVE_INFINITY, v: cls.initial() }),
    ...$eqTimestamped(cls),
    ...$ordTimestamped(cls),
  });

export const $fullDocLwwString = $fullDocLww({
  ...$init(''),
  ...$eqPrime(),
  ...$ordPrime(),
});

export const $fullDocLwwNumber = $fullDocLww({
  ...$init(0),
  ...$eqPrime(),
  ...$ordPrime(),
});

export const $fullDocLwwBoolean = $fullDocLww({
  ...$init(false),
  ...$eqPrime(),
  ...$ordPrime(),
});
