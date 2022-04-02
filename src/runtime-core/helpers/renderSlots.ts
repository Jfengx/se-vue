import { createVNode, Fragment } from '../vnode';
import { Slots } from '../component';

export function renderSlots(slots: Slots, name: string, ...args: any[]) {
  const slot = slots[name];
  if (slot) {
    if (typeof slot === 'function') {
      return createVNode(Fragment, {}, slot(...args));
    }
  }
}
