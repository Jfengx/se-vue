import { effect, stop } from '../effect';
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

  test('scheduler', () => {
    let dummy;
    let run;

    const schedular = vi.fn(() => {
      run = runner;
    });

    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { schedular },
    );

    // effect 第一次执行，不触发 schedular
    expect(schedular).not.toHaveBeenCalled();
    expect(dummy).toBe(1);

    // 执行 set 时，有 schedular 就不执行 fn
    obj.foo += 1;
    // expect(schedular).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(1);

    run();
    expect(dummy).toBe(2);
  });

  test('stop', () => {
    let dummy;
    const obj = reactive({ foo: 1 });
    const runner = effect(() => {
      dummy = obj.foo;
    });

    obj.foo = 2;
    expect(dummy).toBe(2);

    stop(runner);
    obj.foo += 1;
    expect(dummy).toBe(2);

    runner();
    expect(dummy).toBe(3);

    obj.foo = 4;
    expect(dummy).toBe(3);

    runner();
    expect(dummy).toBe(4);
  });

  test('onStop', () => {
    const obj = reactive({
      foo: 1,
    });
    const onStop = vi.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { onStop },
    );

    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });
});
