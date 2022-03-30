import { VNODE, Component } from './vnode';

type ComponentInstance = {
  vnode: VNODE;
  type: Component;
  setupState: unknown;
  render: () => VNODE;
};

export function createComponentInstance(vnode: VNODE): ComponentInstance {
  const component = {
    vnode,
    type: <Component>vnode.type,
    setupState: {},
    render: () => <any>null,
  };
  return component;
}

export function setupComponent(instance: ComponentInstance) {
  // initProps
  // initSlots
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: ComponentInstance) {
  const component = instance.type;

  const { setup } = component!;

  if (setup) {
    const setupRes = setup();
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
