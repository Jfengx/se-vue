import { VNODE, Fragment, Text } from './vnode';
import { ComponentInstance, createComponentInstance, setupComponent } from './component';
import { ShapeFlags } from '../shared/shapeFlags';
import { createAppAPI } from './createApp';
import { effect } from '../reactivity/effect';
import { EMPTY_OBJ } from '../shared';

export type Nullable<T> = T | null;

// 一切皆对象 🐶
export interface RendererNode {
  [key: string]: any;
}

export type RenderOptions<HostElement> = {
  createElement: (type: string) => HostElement;
  patchProp: (el: HostElement, key: string, oldValue: any, newValue: any) => void;
  insert: (el: HostElement, container: HostElement) => void;
};

export type RenderFunc<HostElement> = (
  vnode: VNODE,
  container: HostElement,
  parentComponent?: ParentComponent,
) => void;

export type ParentComponent = ComponentInstance | undefined;

export function createRender<HostElement = RendererNode>(options: RenderOptions<HostElement>) {
  const { createElement, patchProp: hostPatchProps, insert } = options;

  function render(vnode: VNODE, container: HostElement, parentComponent?: ParentComponent) {
    patch(null, vnode, container, parentComponent);
  }

  /**
   * @param n1 old VNODE
   * @param n2 new VNODE
   */
  function patch(
    n1: Nullable<VNODE>,
    n2: VNODE,
    container: HostElement,
    parentComponent: ParentComponent,
  ) {
    const { shapeFlag, type } = n2;

    switch (type) {
      // Fragment 只渲染 children
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      // Text 只渲染 string
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理 'div' 'span' 等字符串类型
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理 Component 类型
          processComponent(n1, n2, container, parentComponent);
        }
        break;
    }
  }

  function processElement(
    n1: Nullable<VNODE>,
    n2: VNODE,
    container: HostElement,
    parentComponent: ParentComponent,
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
      patchElement(n1, n2, container, parentComponent);
    }
  }

  function processComponent(
    n1: Nullable<VNODE>,
    n2: VNODE,
    container: HostElement,
    parentComponent: ParentComponent,
  ) {
    mountComponent(n1, n2, container, parentComponent);
  }

  function processFragment(
    n1: Nullable<VNODE>,
    n2: VNODE,
    container: HostElement,
    parentComponent: ParentComponent,
  ) {
    mountChildren(<VNODE[]>n2.children, container, parentComponent);
  }

  function processText(n1: Nullable<VNODE>, n2: VNODE, container: HostElement) {
    // TODO
    const el: unknown = document.createTextNode(<string>n2.children);
    insert(<HostElement>el, container);
  }

  function mountElement(n2: VNODE, container: HostElement, parentComponent: ParentComponent) {
    const el = (n2.el = createElement(<string>n2.type));
    const { children, props, shapeFlag } = n2;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el['textContent'] = <string>children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(<VNODE[]>children, el, parentComponent);
    }

    for (const key in props) {
      const val = props[key];
      hostPatchProps(el, key, null, val);
    }

    insert(el, container);
  }

  function mountChildren(
    children: VNODE[],
    container: HostElement,
    parentComponent: ParentComponent,
  ) {
    children.forEach((child) => {
      patch(null, child, container, parentComponent);
    });
  }

  function patchElement(
    n1: VNODE,
    n2: VNODE,
    container: HostElement,
    parentComponent: ParentComponent,
  ) {
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;

    // 如何获取el，走 patchElement 即 n1 已经渲染好，所以 el 即为 n1.el
    const el = (n2.el = n1.el);
    patchProps(<HostElement>el, oldProps, newProps);
  }

  // 更新 props，类名啊，数据啊 。。。 的更新
  function patchProps(el: HostElement, oldProps, newProps) {
    // 更新 props
    for (const key in newProps) {
      const oldV = oldProps[key];
      const newV = newProps[key];
      if (oldV !== newV) {
        hostPatchProps(el, key, oldV, newV);
      }
    }
    // 删除 props
    if (oldProps !== EMPTY_OBJ) {
      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProps(el, key, oldProps[key], null);
        }
      }
    }
  }

  function mountComponent(
    n1: Nullable<VNODE>,
    n2: VNODE,
    container: HostElement,
    parentComponent: ParentComponent,
  ) {
    const instance = createComponentInstance(n2, parentComponent);
    setupComponent(instance);
    setupRenderEffect(n2, instance, container);
  }

  function setupRenderEffect(vnode: VNODE, instance: ComponentInstance, container: HostElement) {
    effect(() => {
      const { proxy } = instance;
      // proxy 代理 setup 的返回值以及 $el $date ... 属性
      const subTree = instance.render.call(proxy);

      if (!instance.isMounted) {
        patch(null, subTree, container, instance);
        instance.isMounted = true;
      } else {
        const prevTree = instance.subTree;
        patch(prevTree, subTree, container, instance);
      }

      instance.subTree = subTree;
      vnode.el = subTree.el;
    });
  }

  return {
    createApp: createAppAPI(render),
  };
}
