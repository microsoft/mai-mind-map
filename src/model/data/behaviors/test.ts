import { BehaviorBuilder } from "../behavior";
import eq from "./eq";
import preset from "./preset";
import read from "./read";
import typeName from "./type-name";

const { $string, $number, $boolean, $array, $dict, $struct } =
  BehaviorBuilder.mixin(eq)
    .mixin(preset)
    .mixin(typeName)
    .mixin(read)
    .build();

const p = $struct({ foo: $dict($string), bar: $array($number) });

console.log(p.typeName);

console.log(
  p.read((path) => (msg) => console.log(path, msg))({ bar: [1, 2, '123'] }),
);