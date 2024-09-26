import { behavior } from '../behavior';

export type Signatured = {
  signature: string;
};

const withSignature = (signature: string): Signatured => ({ signature });

export default behavior<Signatured>({
  $string: withSignature('string'),
  $number: withSignature('number'),
  $boolean: withSignature('boolean'),
  $array: ({ signature: typeName }) => withSignature(`Array<${typeName}>`),
  $dict: ({ signature: typeName }) => withSignature(`Dict<${typeName}>`),
  $struct: (stt) =>
    withSignature(
      `{ ${Object.keys(stt)
        .map((key) => `${key}: ${stt[key].signature}`)
        .join('; ')} }`,
    ),
});