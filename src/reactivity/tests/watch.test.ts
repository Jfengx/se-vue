import { watch } from '../watch';
import { reactive } from '../reactive';

describe('watch', () => {
  test('happy path', () => {
    const target = reactive({ foo: 1, bar: 2 });
    const fn = vi.fn(() => {});
    watch(target, fn);
    target.foo = 2;
    expect(fn).toBeCalledTimes(1);
  });

  test('watch new & old', () => {
    const target = reactive({ foo: 1, bar: 2 });
    watch(
      () => target.foo,
      (oldV, newV) => {
        expect(oldV).toBe(1);
        expect(newV).toBe(2);
      },
    );
    target.foo = 2;
  });

  test('watch immediately', () => {
    const target = reactive({ foo: 1, bar: 2 });
    const fn = vi.fn(() => {});
    watch(target, fn, { immediate: true });
    expect(fn).toBeCalledTimes(1);
  });
});
