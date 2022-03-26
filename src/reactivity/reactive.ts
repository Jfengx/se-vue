import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
  shallowReactiveHandlers,
} from './handlers';

function createActiveObject(raw, handlers) {
  return new Proxy(raw, handlers);
}

export const enum ReactiveFlags {
  IS_REACTIVE = '__reactive',
  IS_READONLY = '__readonly',
}

export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers);
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers);
}

export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowReadonlyHandlers);
}

export function shallowReactive(raw) {
  return createActiveObject(raw, shallowReactiveHandlers);
}

export function isReactive(value) {
  return value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
  return value[ReactiveFlags.IS_READONLY];
}
