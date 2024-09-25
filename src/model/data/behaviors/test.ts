import { BehaviorBuilder } from "../behavior";
import eq from "./eq";
import preset from "./preset";
import read from "./read";
import typeName from "./type-name";

const { $string, $number, $boolean, $array, $dict, $struct } =
  BehaviorBuilder
    .mixin(preset)
    .mixin(typeName)
    .mixin(read)
    .mixin(eq)
    .build();

const p = $struct({ foo: $dict($string), bar: $array($number), tic: $boolean });

console.log(p.typeName);

const logErrors = (path: string) => (msg: string) => console.log(`${msg} @ $${path}`);

console.log(
  p.read(logErrors)({ bar: [1, 2, '123'] }),
);