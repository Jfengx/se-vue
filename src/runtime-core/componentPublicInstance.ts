import { ComponentInstance } from './component';

const publicPropertiesMap = {
  $el: (i: ComponentInstance) => i.vnode.el,
  $slots: (i: ComponentInstance) => i.slots,
};

function hasOwn(val: {}, key: string) {
  return Object.prototype.hasOwnProperty.call(val, key);
}

export const publicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance;

    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }

    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
