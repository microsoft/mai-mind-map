import { gwwDocument } from './gww-document';
import { structDocument } from './struct-document';
import { describeDocumentMeta } from '../util/test-utility';

const sttGww = structDocument({
  foo: gwwDocument<string>(),
  bar: gwwDocument<boolean>(),
});

describeDocumentMeta('{ foo: Gww<string>, bar: Gww<boolean> }', sttGww, {
  singleton: [
    {},
    { foo: ['abc', 'cba'], bar: [true, false] },
    { foo: ['abc', 'cba'] },
    { bar: [true, false] },
  ],
  composable3: [
    [{}, { foo: ['abc', 'cba'] }, { foo: ['cba', 'abc'] }],
    [{ foo: ['abc', 'cba'] }, {}, { foo: ['cba', 'abc'] }],
    [{ foo: ['abc', 'cba'] }, { foo: ['cba', 'abc'] }, {}],
    [
      { foo: ['abc', 'cba'] },
      { bar: [true, false] },
      { foo: ['cba', 'abc'], bar: [false, true] },
    ],
    [{ bar: [true, false] }, {}, { bar: [true, false] }],
  ],
  incomposable: [
    [{ foo: ['abc', 'cba'] }, { foo: ['abc', 'cba'] }],
    [{ bar: [true, false] }, { foo: ['abc', 'cba'], bar: [true, false] }],
  ],
  transformable: [
    [{ foo: ['abc', 'cba'] }, { bar: [true, false] }],
    [{ foo: ['abc', 'cba'], bar: [true, false] }, {}],
    [{}, { foo: ['abc', 'cba'], bar: [true, false] }],
    [{ foo: ['abc', 'cba'], bar: [true, false] }, { foo: ['abc', 'xyz'] }],
    [
      { foo: ['abc', 'cba'], bar: [true, false] },
      { foo: ['abc', 'xyz'], bar: [true, false] },
    ],
  ],
  untransformable: [
    [{ foo: ['abc', 'cba'] }, { foo: ['cba', 'abc'] }],
    [{ bar: [true, false] }, { bar: [false, true] }],
    [{ foo: ['abc', 'cba'], bar: [true, false] }, { bar: [false, true] }],
  ],
  others({ equ }) {
    describe('operator equ', () => {
      it('should return true for the semantically equivalent operators', () => {
        expect(equ({ foo: null })({})).toBeTruthy();
        expect(
          equ({ foo: ['x', 'x'], bar: [true, false] })({ bar: [true, false] })
        ).toBeTruthy();
        expect(equ({ foo: ['x', 'x'] })({ bar: [true, true] })).toBeTruthy();
      });

      it('should return false for the non-equivalent operators', () => {
        expect(equ({ foo: ['x', 'y'] })({ foo: ['x', 'z'] })).toBeFalsy();
        expect(equ({ foo: ['x', 'y'] })({ bar: [true, false] })).toBeFalsy();
        expect(equ({ foo: ['x', 'y'] })({ foo: ['z', 'y'] })).toBeFalsy();
        expect(equ({ foo: ['x', 'y'] })({})).toBeFalsy();
        expect(equ({})({ foo: ['x', 'y'] })).toBeFalsy();
      });
    });
  },
});

