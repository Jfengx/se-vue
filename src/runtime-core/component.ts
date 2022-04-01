import { VNODE, Component } from './vnode';
import { publicInstanceProxyHandlers } from './componentPublicInstance';
import { initProps } from './componentProps';
import { shallowReadonly } from '../reactivity/reactive';
import { emit } from './componentEmit';

export type ComponentInstance = {
  vnode: VNODE;
  type: Component;
  props: any;
  proxy: any;
  setupState: any;
  render: () => VNODE;
  emit: (event: string) => void;
};

export function createComponentInstance(vnode: VNODE): ComponentInstance {
  const componentInstance = {
    vnode,
    type: <Component>vnode.type,
    setupState: {},
    props: null,
    proxy: null,
    emit: <any>null,
    render: () => <any>null,
  };
  componentInstance.emit = emit.bind(null, componentInstance);
  return componentInstance;
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
