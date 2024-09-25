import { BehaviorBuilder } from "../behavior";
import eq from "./eq";
import preset from "./preset";

const t = BehaviorBuilder.mixin(eq).mixin(preset).build();
const str = t.$string;

const p = t.$struct({ foo: t.$string, bar: t.$array(t.$number) });