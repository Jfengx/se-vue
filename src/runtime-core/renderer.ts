import { VNODE, Fragment, Text } from './vnode';
import { ComponentInstance, createComponentInstance, setupComponent } from './component';
import { ShapeFlags } from '../shared/shapeFlags';
import { createAppAPI } from './createApp';

// 一切皆对象 🐶
export interface RendererNode {
  [key: string]: any;
}

export type RenderOptions<HostElement> = {
  createElement: (type: string) => HostElement;
  patchProp: (el: HostElement, key: string, propValue: any) => void;
  insert: (el: HostElement, container: HostElement) => void;
};

export type RenderFunc<HostElement> = (
  vnode: VNODE,
  container: HostElement,
  parentComponent?: ParentComponent,
) => void;

export type ParentComponent = ComponentInstance | undefined;

export function createRender<HostElement = RendererNode>(options: RenderOptions<HostElement>) {
  const { createElement, patchProp, insert } = options;

  function render(vnode, container: HostElement, parentComponent?: ParentComponent) {
    patch(vnode, container, parentComponent);
  }

  function patch(vnode: VNODE, container: HostElement, parentComponent: ParentComponent) {
    const { shapeFlag, type } = vnode;

    switch (type) {
      // Fragment 只渲染 children
      case Fragment:
        processFragment(vnode, container, parentComponent);
        break;
      // Text 只渲染 string
      case Text:
        processText(vnode, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理 'div' 'span' 等字符串类型
          processElement(vnode, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理 Component 类型
          processComponent(vnode, container, parentComponent);
        }
        break;
    }
  }

  function processElement(vnode: VNODE, container: HostElement, parentComponent: ParentComponent) {
    mountElement(vnode, container, parentComponent);
  }

  function processComponent(
    vnode: VNODE,
    container: HostElement,
    parentComponent: ParentComponent,
  ) {
    mountComponent(vnode, container, parentComponent);
  }

  function processFragment(vnode: VNODE, container: HostElement, parentComponent: ParentComponent) {
    mountChildren(<VNODE[]>vnode.children, container, parentComponent);
  }

  function processText(vnode: VNODE, container: HostElement) {
    // TODO
    const el: unknown = document.createTextNode(<string>vnode.children);
    insert(<HostElement>el, container);
  }

  function mountElement(vnode: VNODE, container: HostElement, parentComponent: ParentComponent) {
    const el = (vnode.el = createElement(<string>vnode.type));
    const { children, props, shapeFlag } = vnode;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // TODO
      el['textContent'] = <string>children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(<VNODE[]>children, el, parentComponent);
    }

    for (const key in props) {
      const val = props[key];
      patchProp(el, key, val);
    }

    insert(el, container);
  }

  function mountChildren(
    children: VNODE[],
    container: HostElement,
    parentComponent: ParentComponent,
  ) {
    children.forEach((child) => {
      patch(child, container, parentComponent);
    });
  }

  function mountComponent(vnode: VNODE, container: HostElement, parentComponent: ParentComponent) {
    const instance = createComponentInstance(vnode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(vnode, instance, container);
  }

  function setupRenderEffect(vnode: VNODE, instance: ComponentInstance, container: HostElement) {
    const { proxy } = instance;
    // proxy 代理 setup 的返回值以及 $el $date ... 属性
    const subTree = instance.render.call(proxy);
    patch(subTree, container, instance);

    vnode.el = subTree.el;
  }

  return {
    createApp: createAppAPI(render),
  };
}
