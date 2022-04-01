import { isObject } from '../shared/index';
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
  shallowReactiveHandlers,
} from './handlers';

function createActiveObject(raw, handlers) {
  if (!isObject(raw)) {
    console.warn(`target: ${raw} 必须是一个对象`);
    return raw;
  }
  return new Proxy(raw, handlers);
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
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}

export const enum ReactiveFlags {
  IS_REACTIVE = '__reactive',
  IS_READONLY = '__readonly',
}
