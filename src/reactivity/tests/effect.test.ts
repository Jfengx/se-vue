import { effect } from '../effect';
import { reactive } from '../reactive';

describe('effect', () => {
  test('deps track trigger', () => {
    const user = reactive({
      age: 10,
    });

    let nextAge;

    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    user.age += 1;
    expect(nextAge).toBe(12);
  });

  test('return runner', () => {
    let foo = 10;

    const runner = effect(() => {
      foo += 1;
      return 'foo';
    });

    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12);
    expect(r).toBe('foo');
  });
});
