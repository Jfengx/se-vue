import { isReadonly, shallowReadonly } from '../reactive';

describe('shallowReadonly', () => {
  test('shallowReadonly', () => {
    const v = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(v)).toBe(true);
    expect(isReadonly(v.n)).toBe(undefined);
  });
});
