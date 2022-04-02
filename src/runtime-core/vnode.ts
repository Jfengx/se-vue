import { ShapeFlag, ShapeFlags } from '../shared/shapeFlags';
import { Slots } from './component';

export type CHILDREN = null | string | VNODE[] | Slots;

export type VNODE = {
  type: ComponentType;
  props: Record<string, any>;
  children: CHILDREN;
  el: null | HTMLElement;
  shapeFlag: ShapeFlag;
};

export type Component = {
  render(): VNODE;
  setup?: (props: any, context: { emit: (event: string, ...args: any[]) => void }) => unknown;
};

export type ComponentType = Component | string | symbol;

export const Fragment = Symbol('Fragment');

export function createVNode(type: ComponentType, props?, children?): VNODE {
  const vnode = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type),
  };

  if (typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }

  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === 'object') {
      vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN;
    }
  }

  return vnode;
}

export function getShapeFlag(type: ComponentType) {
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}
