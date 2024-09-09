## Usage Sample

Declare atoms any where
```ts
export const atomA = atom(1);
export const atomB = atom('2');
export const atomC = atom<string[]>([]);
```

Consume atoms
```tsx
import React from 'react';

const BizA = () => {
  const [a] = useAtom(atomA);
  const [b] = useAtom(atomB);
  const setC = useChange(atomC);
  const removeB = () => setC(list => list.filter(item => (item !== b)));;
  return <div onClick={removeB}>{a}</div>;
};

const BizB  = () => {
  const [list] = useAtom(store.c);
  return (
    <div>
      {list.map(item => <span>{item}</span>)}
    </div>
  );
};

const App = () => (
  <WithStore>
    <div><BizA /></div>
    <div><BizB /></div>
  </WithStore>
);

export default App;
```

## API Referrence
#### ① WithStore
Nothing special for this, just make it as the root of the compoment tree. then all descendant components can share atoms.

Better to use it in this way
```tsx
const root = ReactDOM.createRoot(rootEl);
root.render(
  <WithStore>
    <YourRootAppComponent />
  </WithStore>
);
```

#### ② atom, useAtom, useChange
Simple atom with only data
```tsx
const a = atom(123);

const [data, setData] = useAtom(a);
console.log(data); // 123
setDate(456); // change to 456

const setData = useChange(a);
setData(456); // change to 456
setDate((old) => old + 111); // change from 456 to 567
```

What's the difference between `useAtom` and `useChange`
```tsx
// when data in atom changes, component A will re-render
function A() {
  const [data, setData] = useAtom(a);
  return ...;
}

// when data in atom changes, component B won't re-render
function B() {
  const setData = useChange(a);
  return ...;
}
```

Complex atom with actions
```tsx
interface Payload {
  name: string;
  age: string;
  optimize?: boolean;
}

const DefaultPayload: Payload = {
  name: 'JiaShuang',
  age: 18,
};

const b = atom(35);
const a = atom(DefaultPayload, (get, set, use) => {
  function changName(name: string) {
    set({ ...get(), name });
  }
  function changeAge(age: number) {
    set({ ...get(), age });
  }
  function checkOptimize() {
    // query data from other atom
    const line = use(b).data;
    const payload = get();
    if (payload.age > line) {
      set({ ...payload, optimize: true });
    }
  }
});

const [payload, setPayload, actions] = useAtom(a);
actions.changName('Yanzu Wu');
actions.changeAge(48);
actions.checkOptimize();

const [setPayload, actions] = useChange(a);
...
```

#### ③ proxy
Just like the middleware of redux, set a proxy to atom can help a lot

For example, if you want to track the call stack of atom data change:
```tsx
const a = atom(123);
a.proxy = (set) => (change) => {
  console.trace();
  return set(change);
};
```
