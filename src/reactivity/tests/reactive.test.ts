import { reactive } from '../reactive';

describe('reactive', () => {
  test('happy path', () => {
    const original = { foo: 1 };
    const observed = reactive(original);

    // 不相等
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
  });
});
