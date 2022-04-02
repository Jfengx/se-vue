import { ComponentInstance, Slots } from './component';
import { VNODE } from './vnode';
import { ShapeFlags } from '../shared/shapeFlags';

export function initSlots(instance: ComponentInstance, children) {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    normalizeObjectSlots(children, instance.slots);
  }
}

function normalizeSlotValue(value: VNODE | VNODE[]) {
  return Array.isArray(value) ? value : [value];
}

function normalizeObjectSlots(children, slots: Slots) {
  for (const key in children) {
    const value = children[key];
    slots[key] = (props) => normalizeSlotValue(value(props));
  }
}
