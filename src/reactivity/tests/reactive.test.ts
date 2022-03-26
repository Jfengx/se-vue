import { reactive, isReactive } from '../reactive';

describe('reactive', () => {
  test('happy path', () => {
    const original = { foo: 1 };
    const observed = reactive(original);

    // 不相等
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);

    expect(isReactive(observed)).toBe(true);
  });

  test('nested reactive', () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    };

    const observed = reactive(original);

    expect(isReactive(observed)).toBe(true);
    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
  });
});
