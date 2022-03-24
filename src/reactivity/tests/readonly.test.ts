import { readonly, isReadonly } from '../reactive';

describe('readonly', () => {
  test('happy path', () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);

    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
    expect(isReadonly(wrapped)).toBe(true);
  });

  test('warn when call set', () => {
    // mock
    console.warn = vi.fn();

    const user = readonly({
      age: 10,
    });

    user.age = 11;

    expect(console.warn).toBeCalled();
  });
});
