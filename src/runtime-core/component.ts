import { VNODE, Component } from './vnode';
import { publicInstanceProxyHandlers } from './componentPublicInstance';
import { initProps } from './componentProps';
import { shallowReadonly } from '../reactivity/reactive';

export type ComponentInstance = {
  vnode: VNODE;
  type: Component;
  props: any;
  proxy: any;
  setupState: any;
  render: () => VNODE;
};

export function createComponentInstance(vnode: VNODE): ComponentInstance {
  const component = {
    vnode,
    type: <Component>vnode.type,
    setupState: {},
    props: null,
    proxy: null,
    render: () => <any>null,
  };
  return component;
}

export function setupComponent(instance: ComponentInstance) {
  initProps(instance, instance.vnode.props);
  // initSlots
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: ComponentInstance) {
  const component = instance.type;

  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);

  const { setup } = component!;

  if (setup) {
    const setupRes = setup(shallowReadonly(instance.props));
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
