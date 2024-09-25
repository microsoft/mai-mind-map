import { behavior } from "../behavior";

export type TypeName = {
  typeName: string;
};

const withTypeName = (typeName: string): TypeName => ({ typeName });

export default behavior<TypeName>({
  $string: withTypeName('string'),
  $number: withTypeName('number'),
  $boolean: withTypeName('boolean'),
  $array: ({ typeName }) => withTypeName(`Array<${typeName}>`),
  $dict: ({ typeName }) => withTypeName(`Dict<${typeName}>`),
  $struct: (stt) =>
    withTypeName(
      `{ ${Object.keys(stt)
        .map((key) => `${key}: ${stt[key].typeName}`)
        .join('; ')} }`,
    ),
});