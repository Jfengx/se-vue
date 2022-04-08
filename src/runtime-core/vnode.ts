import { ShapeFlag, ShapeFlags } from '../shared/shapeFlags';
import { Slots, ComponentInstance } from './component';
import { RendererNode } from './renderer';

export type CHILDREN<HostElement> = null | string | VNODE<HostElement>[] | Slots;

export type VNODE<HostElement = RendererNode> = {
  type: ComponentType;
  props: Record<string, any>;
  children: CHILDREN<HostElement>;
  el: null | HostElement;
  shapeFlag: ShapeFlag;
  key: any;
  component: ComponentInstance;
};

export type Component = {
  render(): VNODE;
  setup?: (props: any, context: { emit: (event: string, ...args: any[]) => void }) => unknown;
};

export type ComponentType = Component | string | symbol;

export const Fragment = Symbol('Fragment');
export const Text = Symbol('Text');

export function createVNode<HostElement = RendererNode>(
  type: ComponentType,
  props?,
  children?,
): VNODE<HostElement> {
  const vnode = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type),
    key: props && props.key,
    component: <any>null,
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

export function createTextVNode(text: string) {
  return createVNode(Text, {}, text);
}

export function getShapeFlag(type: ComponentType) {
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}
