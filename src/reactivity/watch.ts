import { effect } from './effect';

export function watch(value, fn, opts: any = {}) {
  let oldV;
  let newV;

  const job = () => {
    newV = effectFn();
    fn(oldV, newV);
    oldV = newV;
  };

  const effectFn = effect(
    // 硬编码 达咩
    // () => {
    //   console.log(value.foo);
    // },
    valGetter(value),
    {
      // 为了获取第一次执行的值
      lazy: true,
      schedular: job,
    },
  );

  if (!opts.immediate) {
    oldV = effectFn();
  } else {
    job();
  }
}

function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) return;
  seen.add(value);
  // 暂且只考虑对象
  for (const key in value) {
    // value[key] 相当于触发 getter
    traverse(value[key], seen);
  }
  return value;
}

// watch(() => { obj.xxx }, fn) | watch(obj, fn)
function valGetter(value) {
  return typeof value === 'function' ? value : () => traverse(value);
}
