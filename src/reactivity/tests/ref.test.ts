import { effect } from '../effect';
import { ref, proxyRefs, isRef, unRef } from '../ref';
import { reactive } from '../reactive';

describe('ref', () => {
  test('happy', () => {
    const a = ref(1);
    expect(a.value).toBe(1);
  });

  test('should be reactive', () => {
    const a = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls += 1;
      dummy = a.value;
    });
    expect(calls).toBe(1);
    expect(dummy).toBe(1);

    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);

    // 相同值不触发 trigger;
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  });

  test('nested', () => {
    const a = ref({
      count: 1,
    });
    let dummy;
    effect(() => {
      dummy = a.value.count;
    });

    expect(dummy).toBe(1);

    a.value.count = 2;
    expect(dummy).toBe(2);
  });

  test('isRef', () => {
    const a = ref(1);
    const user = reactive({ age: 1 });
    expect(isRef(a)).toBe(true);
    expect(isRef(1)).toBe(false);
    expect(isRef(user)).toBe(false);
  });

  test('unRef', () => {
    const a = ref(1);
    expect(unRef(a)).toBe(1);
    expect(unRef(1)).toBe(1);
  });

  test('proxyRefs', () => {
    const user = {
      age: ref(0),
      name: 'J',
    };
    const proxyUser = proxyRefs(user);
    expect(user.age.value).toBe(0);
    expect(proxyUser.age).toBe(0);
    expect(proxyUser.name).toBe('J');

    proxyUser.age = 20;
    expect(user.age.value).toBe(20);
    expect(proxyUser.age).toBe(20);

    proxyUser.age = ref(10);
    expect(user.age.value).toBe(10);
    expect(proxyUser.age).toBe(10);
  });
});
