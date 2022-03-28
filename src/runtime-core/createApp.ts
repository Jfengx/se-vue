import { createVNode } from './vnode';
import { render } from './render';

export function createApp(rootComponent) {
  // 全部基于 vnode （虚拟节点）操作
  return {
    mount(root) {
      const vnode = createVNode(rootComponent);
      render(vnode, root);
    },
  };
}
