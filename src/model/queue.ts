const HEAD_VALUE = Symbol();

type Item<T> = {
  value: T | typeof HEAD_VALUE;
  prev: Item<T>;
  next: Item<T>;
};

export type Queue<T> = {
  isEmpty(): boolean;
  toArray(): T[];
  enqueue(value: T): () => void;
  clear(): void;
};

export function queue<T>(): Queue<T> {
  const head = { value: HEAD_VALUE } as Item<T>;

  function circle(item: Item<T>) {
    item.prev = item.next = item;
  }

  function clear() {
    circle(head);
  }

  function isEmpty(): boolean {
    return head.prev === head;
  }

  function toArray(): T[] {
    const arr: T[] = [];
    let iter = head.next;
    while (iter.value !== HEAD_VALUE) {
      arr.push(iter.value);
      iter = iter.next;
    }
    return arr;
  }

  function enqueue(value: T): () => void {
    const item = { value, prev: head.prev, next: head };
    head.prev = head.prev.next = item;
    return () => {
      item.prev.next = item.next;
      item.next.prev = item.prev;
      circle(item);
    };
  }

  circle(head);

  return { isEmpty, toArray, clear, enqueue };
}
