import { createVNode } from './vnode';
import { render } from './renderer';

export function createApp(rootComponent) {
  // 全部基于 vnode （虚拟节点）操作
  return {
    mount(root: HTMLElement) {
      const vnode = createVNode(rootComponent);
      render(vnode, root);
    },
  };
}
