import { track, trigger } from './effect';
import { ReactiveFlags, reactive, readonly } from './reactive';
import { isObject, extend } from '../shared/index';

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }

    const res = Reflect.get(target, key);

    if (!isReadonly) {
      track(target, key);
    }

    // 不处理嵌套的对象
    if (shallow) {
      return res;
    }

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
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
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const shallowReactiveGet = createGetter(false, true);

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    console.warn(`key: ${key} set 失败，${target} readonly`);
    return true;
  },
};

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
});

export const shallowReactiveHandlers = extend({}, mutableHandlers, {
  get: shallowReactiveGet,
});
