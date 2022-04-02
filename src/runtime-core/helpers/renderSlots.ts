import { createVNode } from '../vnode';
import { Slots } from '../component';

export function renderSlots(slots: Slots, name: string, ...args: any[]) {
  const slot = slots[name];
  if (slot) {
    // 为了用 div 包一下
    // 直接 return slots[name](...args)[0]; 也能渲染
    return createVNode('div', {}, slot(...args));
  }
}
