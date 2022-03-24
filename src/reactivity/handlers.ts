import { track, trigger } from './effect';
import { ReactiveFlags } from './reactive';

function createGetter(isReadonly = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key);

    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }

    if (!isReadonly) {
      track(target, key);
    }
    return res;
  };
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  };
}

// export const mutableHandlers = {
//   get: createGetter(),
//   set: createSetter(),
// };

// ↑ 每次调用 mutableHandlers 都会 create
// ↓ 优化

const get = createGetter();
const set = createSetter();

export const mutableHandlers = {
  get,
  set,
};

const readonlyGet = createGetter(true);

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    console.warn(`key: ${key} set 失败，${target} readonly`);
    return true;
  },
};
