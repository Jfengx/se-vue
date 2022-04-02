import { ComponentInstance } from './component';
import { camelize, toHandleKey } from '../shared/index';

export function initEmit(instance: ComponentInstance, event: string, ...args: any[]) {
  const { props } = instance;
  props[toHandleKey(camelize(event))]?.(...args);
}
