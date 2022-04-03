import { createVNode, Component } from './vnode';
import { RenderFunc, RendererNode } from './renderer';

export function createAppAPI<HostElement = RendererNode>(render: RenderFunc<HostElement>) {
  return function createApp(rootComponent: Component) {
    return {
      mount(root: HostElement) {
        const vnode = createVNode(rootComponent);
        render(vnode, root);
      },
    };
  };
}
