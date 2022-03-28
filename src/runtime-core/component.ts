export function createComponentInstance(vnode) {
  const component = {
    vnode,
  };

  return component;
}

export function setupComponent(instance) {
  // TODO initProps initSlots
  // initProps()
  // initSlots()

  setupStatefulComponent(instance);
}

export function setupStatefulComponent(instance) {
  const Component = instance.vnode.type;
  const { setup } = Component;

  if (setup) {
    // func or object
    const setupRes = setup();

    handleSetupResult(instance, setupRes);
  }
}

function handleSetupResult(instance, setupRes) {
  // setupRes obj or func
  // TODO func

  if (typeof setupRes === 'object') {
    instance.setupState = setupRes;
  }

  finsishComponentSetup(instance);
}

function finsishComponentSetup(instance) {
  const Component = instance.type;

  if (!Component.render) {
    instance.render = Component.render;
  }
}
