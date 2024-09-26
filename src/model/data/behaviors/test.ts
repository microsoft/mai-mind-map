import { BehaviorBuilder } from "../behavior";
import editable from "./editable";
import eq from "./eq";
import preset from "./preset";
import readable, { readData } from "./readable";
import signatured from "./signatured";

const { $string, $number, $boolean, $array, $dict, $struct } =
  BehaviorBuilder
    .mixin(preset)
    .mixin(signatured)
    .mixin(readable)
    .mixin(eq)
    .mixin(editable)
    .build();

const myDocType = $struct({
  foo: $dict($string),
  bar: $array($number),
  tic: $boolean,
});


console.log("Format", myDocType.signature);

const content = { bar: [1, 2, '123'] };
console.log("Read", JSON.stringify(content));
const readDoc = readData(myDocType);
const doc = readDoc(content, console.log);

console.log("Result", JSON.stringify(doc));
console.log(
  'Composed',
  JSON.stringify(
    myDocType.update(
      (cur) => ({
        foo: { "Hello": { o: (cur.foo.Hello ?? ""), n: "World", t: 0 } },
        bar: { i: [{ i: 1, a: [3, 4, 5] }], d: [] },
        tic: { o: cur.tic, n: true, t: 0 },
      }),
    )(doc),
  ),
);