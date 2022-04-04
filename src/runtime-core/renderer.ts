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
  remove: (el: HostElement, container: HostElement) => void;
  setElementText: (el: HostElement, text: string) => void;
};

export type RenderFunc<HostElement> = (
  vnode: VNODE,
  container: HostElement,
  parentComponent?: ParentComponent,
) => void;

export type ParentComponent = ComponentInstance | undefined;

export function createRender<HostElement = RendererNode>(options: RenderOptions<HostElement>) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProps,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

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
    hostInsert(<HostElement>el, container);
  }

  function mountElement(n2: VNODE, container: HostElement, parentComponent: ParentComponent) {
    const el = (n2.el = hostCreateElement(<string>n2.type));
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

    hostInsert(el, container);
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
    patchChildren(n1, n2, parentComponent);
  }

  // 更新 props，dom为例，即dom的attributes，对应到组件上（onXXX func, props data）
  function patchProps(el: HostElement, oldProps, newProps) {
    // 更新 props[xxx]
    for (const key in newProps) {
      const oldV = oldProps[key];
      const newV = newProps[key];
      if (oldV !== newV) {
        hostPatchProps(el, key, oldV, newV);
      }
    }
    // 删除 props[xxx]
    if (oldProps !== EMPTY_OBJ) {
      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProps(el, key, oldProps[key], null);
        }
      }
    }
  }

  // 更新 子节点
  function patchChildren(n1: VNODE, n2: VNODE, parentComponent: ParentComponent) {
    const { shapeFlag: oldFlag, el, children: c1 } = n1;
    const { shapeFlag: newFlag, children: c2 } = n2;

    // array | text -> text
    if (newFlag & ShapeFlags.TEXT_CHILDREN) {
      if (oldFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 清空之前的子元素，以渲染好 children[x].el 是有 HostElement 挂载的
        unmountChildren(<VNODE[]>c1, <HostElement>el);
      }
      if (c1 !== c2) {
        // 设置 text
        hostSetElementText(<HostElement>el, <string>c2);
      }
    } else {
      // text | array -> array
      if (newFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (oldFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(<HostElement>el, '');
          mountChildren(<VNODE[]>c2, <HostElement>el, parentComponent);
        }
      }
    }
  }

  // 移除 VNODE[] 子元素
  function unmountChildren(children: VNODE[], container: HostElement) {
    for (let i = 0; i < children.length; i += 1) {
      const el = children[i].el;
      hostRemove(<HostElement>el, container);
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
