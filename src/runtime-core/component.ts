import { shallowReadonly } from '../reactivity/reactive';
import { VNODE, Component } from './vnode';
import { initEmit as emit } from './componentEmit';
import { initProps } from './componentProps';
import { initSlots } from './componentSlots';
import { publicInstanceProxyHandlers } from './componentPublicInstance';
import { ParentComponent } from './renderer';

export type Slot = (...agrs: any[]) => VNODE | VNODE[];

export type Slots = Record<string, Slot>;

export type ComponentInstance = {
  vnode: VNODE;
  type: Component;
  parent: ParentComponent;
  proxy: any;
  render: () => VNODE;
  setupState: any;
  props: any;
  emit: (event: string) => void;
  slots: Slots;
  provides: Record<string, any>;
};

export function createComponentInstance(vnode: VNODE, parent: ParentComponent): ComponentInstance {
  const componentInstance = {
    vnode,
    type: <Component>vnode.type,
    parent,
    proxy: null,
    render: () => <any>null,
    setupState: {},
    props: null,
    emit: <any>null,
    slots: {},
    provides: Object.create(parent?.provides ?? null),
  };
  componentInstance.emit = emit.bind(null, componentInstance);
  return componentInstance;
}

export function setupComponent(instance: ComponentInstance) {
  initProps(instance, instance.vnode.props);
  initSlots(instance, <Slots>instance.vnode.children);
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: ComponentInstance) {
  const component = instance.type;

  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);

  const { setup } = component!;

  if (setup) {
    setCurrentInstance(instance);
    const setupRes = setup(shallowReadonly(instance.props), { emit: instance.emit });
    setCurrentInstance(null);
    handleSetupRes(instance, setupRes);
  }
}

function handleSetupRes(instance: ComponentInstance, setupRes) {
  if (typeof setupRes === 'object') {
    instance.setupState = setupRes;
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance: ComponentInstance) {
  const component = instance.type;
  instance.render = component.render;
}

let currentInstance;

export function setCurrentInstance(instance: ComponentInstance | null) {
  currentInstance = instance;
}
export function getCurrentInstance(): ComponentInstance | null {
  return currentInstance;
}
