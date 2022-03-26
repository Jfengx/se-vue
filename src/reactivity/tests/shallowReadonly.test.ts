import { isReadonly, shallowReadonly, isProxy } from '../reactive';

describe('shallowReadonly', () => {
  test('shallowReadonly', () => {
    const v = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(v)).toBe(true);
    expect(isReadonly(v.n)).toBe(false);
    expect(isProxy(v.n)).toBe(false);
  });
});
