import { Behavior, behavior } from "../behavior";
import { $Var } from "../higher-kinded-type";

export type TypeName = {
  typeName: string;
};

const typeNameOf = (typeName: string): TypeName => ({ typeName });

const typeName: Behavior<TypeName> = {
  $string: typeNameOf('string'),
  $number: typeNameOf('number'),
  $boolean: typeNameOf('boolean'),
  $array: ({ typeName }) => typeNameOf(`Array<${typeName}>`),
  $dict: ({ typeName }) => typeNameOf(`Dict<${typeName}>`),
  $struct: (stt) =>
    typeNameOf(
      `{ ${Object.keys(stt)
        .map((key) => `${key}: ${stt[key].typeName}`)
        .join('; ')} }`,
    ),
};

export default behavior(typeName);