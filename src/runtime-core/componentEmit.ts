import { ComponentInstance } from './component';
import { camelize, toHandleKey } from '../shared/index';

export function emit(instance: ComponentInstance, event: string, ...args: any[]) {
  const { props } = instance;
  props[toHandleKey(camelize(event))]?.(...args);
}
