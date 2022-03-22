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
});
