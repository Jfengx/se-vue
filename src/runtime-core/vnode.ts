import { ShapeFlag, ShapeFlags } from '../shared/shapeFlags';

export type VNODE = {
  type: ComponentType;
  props: Record<string, any>;
  children: null | string | VNODE[];
  el: null | HTMLElement;
  shapeFlag: ShapeFlag;
};

export type Component = {
  render(): VNODE;
  setup?: () => unknown;
};

export type ComponentType = Component | string;

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

  return vnode;
}

export function getShapeFlag(type: ComponentType) {
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}
