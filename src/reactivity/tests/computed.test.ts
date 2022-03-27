import { reactive } from '../reactive';
import { computed } from '../computed';

describe('computed', () => {
  test('happy path', () => {
    const user = reactive({ age: 1 });
    const age = computed(() => user.age);

    expect(age.value).toBe(1);
  });

  test('compute lazily', () => {
    const value = reactive({ foo: 1 });

    const getter = vi.fn(() => {
      return value.foo;
    });

    const cValue = computed(getter);

    expect(getter).not.toHaveBeenCalled();

    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    // 相同 cValue.value 不执行 getter
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // 不用 cValue.value 不执行 getter
    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);

    // 不同 cValue.value 用的时候执行 getter
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);
  });
});
