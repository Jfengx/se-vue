import { shallowReadonly } from '../reactivity/reactive';
import { VNODE, Component } from './vnode';
import { initEmit as emit } from './componentEmit';
import { initProps } from './componentProps';
import { initSlots } from './componentSlots';
import { publicInstanceProxyHandlers } from './componentPublicInstance';

export type Slot = (...agrs: any[]) => VNODE | VNODE[];

export type Slots = Record<string, Slot>;

export type ComponentInstance = {
  vnode: VNODE;
  type: Component;
  props: any;
  proxy: any;
  setupState: any;
  render: () => VNODE;
  emit: (event: string) => void;
  slots: Slots;
};

export function createComponentInstance(vnode: VNODE): ComponentInstance {
  const componentInstance = {
    vnode,
    type: <Component>vnode.type,
    setupState: {},
    props: null,
    proxy: null,
    emit: <any>null,
    slots: {},
    render: () => <any>null,
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
    const setupRes = setup(shallowReadonly(instance.props), { emit: instance.emit });
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
