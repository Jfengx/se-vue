import { isReactive, shallowReactive, isProxy } from '../reactive';
import { effect } from '../effect';

describe('shallowReactive', () => {
  test('shallowReactive', () => {
    const v = shallowReactive({ n: { foo: 1 } });
    expect(isReactive(v)).toBe(true);
    expect(isReactive(v.n)).toBe(false);
    expect(isProxy(v.n)).toBe(false);
  });

  test('track shallowReactive', () => {
    const v = shallowReactive({ m: 1, n: { foo: 1 } });

    let m;
    effect(() => {
      m = v.m + 1;
    });
    v.m = 2;
    expect(m).toBe(3); // !!

    let n;
    effect(() => {
      n = v.n.foo + 1;
    });
    v.n.foo = 2;
    expect(n).toBe(2); // !!
  });
});
