import { gwwDocument } from './gww-document';
import { recordDocument } from './record-document';
import { describeDocumentMeta } from '../util/test-utility';

const recGww = recordDocument(gwwDocument<string>());

describeDocumentMeta('Record<string, Gww<string>>', recGww, {
  singleton: [
    {},
    { foo: ['abc', 'cba'] },
    { foo: ['abc', 'cba'], bar: ['cba', ''] },
    { foo: ['abc', 'cba'], bar: null },
  ],
  composable3: [
    [{}, { foo: ['abc', 'cba'], bar: ['cba', 'xyz'] }, { foo: ['cba', 'zyx'] }],
    [{ foo: ['abc', 'cba'], bar: ['cba', 'xyz'] }, {}, { foo: ['cba', 'zyx'] }],
    [{ foo: ['abc', 'cba'], bar: ['cba', 'xyz'] }, { foo: ['cba', 'zyx'] }, {}],
    [{ foo: ['abc', 'cba'], bar: ['cba', 'xyz'] }, {}, { foo: ['abc', 'zyx'] }],
  ],
  incomposable: [[{ foo: ['abc', 'cba'] }, { foo: ['abc', 'xyz'] }]],
  transformable: [
    [{}, { foo: ['abc', 'cba'] }],
    [{ foo: ['abc', 'cba'] }, {}],
    [{ foo: ['abc', 'cba'] }, { bar: ['cba', 'abc'] }],
    [{ foo: ['abc', 'cba'] }, { foo: ['abc', 'xyz'] }],
  ],
  untransformable: [[{ foo: ['abc', 'cba'] }, { foo: ['cba', 'abc'] }]],
  others({ equ }) {
    describe('operator equ', () => {
      it('should return true for the semantically equivalent operators', () => {
        expect(equ({ foo: null })({})).toBeTruthy();
        expect(
          equ({ foo: ['x', 'x'], bar: ['x', 'y'] })({ bar: ['x', 'y'] })
        ).toBeTruthy();
        expect(equ({ foo: ['x', 'x'] })({ bar: ['y', 'y'] })).toBeTruthy();
      });

      it('should return false for the non-equivalent operators', () => {
        expect(equ({ foo: ['x', 'y'] })({ foo: ['x', 'z'] })).toBeFalsy();
        expect(equ({ foo: ['x', 'y'] })({ bar: ['x', 'y'] })).toBeFalsy();
        expect(equ({ foo: ['x', 'y'] })({ foo: ['z', 'y'] })).toBeFalsy();
        expect(equ({ foo: ['x', 'y'] })({})).toBeFalsy();
        expect(equ({})({ foo: ['x', 'y'] })).toBeFalsy();
      });
    });
  },
});
