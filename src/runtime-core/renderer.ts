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
  insert: (el: HostElement, container: HostElement, anchor: Nullable<HostElement>) => void;
  remove: (el: HostElement) => void;
  setElementText: (el: HostElement, text: string) => void;
};

export type RenderFunc<HostElement> = (
  vnode: VNODE<HostElement>,
  container: HostElement,
  parentComponent: ParentComponent,
) => void;

export type ParentComponent = Nullable<ComponentInstance>;

export function createRender<HostElement = RendererNode>(options: RenderOptions<HostElement>) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProps,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

  function render(
    vnode: VNODE<HostElement>,
    container: HostElement,
    parentComponent: ParentComponent,
  ) {
    patch(null, vnode, container, parentComponent, null);
  }

  /**
   * @param n1 old VNODE
   * @param n2 new VNODE
   */
  function patch(
    n1: Nullable<VNODE<HostElement>>,
    n2: VNODE<HostElement>,
    container: HostElement,
    parentComponent: ParentComponent,
    anchor: Nullable<HostElement>,
  ) {
    const { shapeFlag, type } = n2;

    switch (type) {
      // Fragment 只渲染 children
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      // Text 只渲染 string
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理 'div' 'span' 等字符串类型
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理 Component 类型
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }

  function processElement(
    n1: Nullable<VNODE<HostElement>>,
    n2: VNODE<HostElement>,
    container: HostElement,
    parentComponent: ParentComponent,
    anchor: Nullable<HostElement>,
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  function processComponent(
    n1: Nullable<VNODE<HostElement>>,
    n2: VNODE<HostElement>,
    container: HostElement,
    parentComponent: ParentComponent,
    anchor: Nullable<HostElement>,
  ) {
    mountComponent(n1, n2, container, parentComponent, anchor);
  }

  function processFragment(
    n1: Nullable<VNODE<HostElement>>,
    n2: VNODE<HostElement>,
    container: HostElement,
    parentComponent: ParentComponent,
    anchor: Nullable<HostElement>,
  ) {
    mountChildren(<VNODE<HostElement>[]>n2.children, container, parentComponent, anchor);
  }

  function processText(n1: Nullable<VNODE>, n2: VNODE, container: HostElement) {
    // TODO
    const el: unknown = document.createTextNode(<string>n2.children);
    hostInsert(<HostElement>el!, container, null);
  }

  function mountElement(
    n2: VNODE<HostElement>,
    container: HostElement,
    parentComponent: ParentComponent,
    anchor: Nullable<HostElement>,
  ) {
    const el = (n2.el = hostCreateElement(<string>n2.type));
    const { children, props, shapeFlag } = n2;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el['textContent'] = <string>children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(<VNODE<HostElement>[]>children, el, parentComponent, anchor);
    }

    for (const key in props) {
      const val = props[key];
      hostPatchProps(el, key, null, val);
    }

    hostInsert(el, container, anchor);
  }

  function mountChildren(
    children: VNODE<HostElement>[],
    container: HostElement,
    parentComponent: ParentComponent,
    anchor: Nullable<HostElement>,
  ) {
    children.forEach((child) => {
      patch(null, child, container, parentComponent, anchor);
    });
  }

  function patchElement(
    n1: VNODE<HostElement>,
    n2: VNODE<HostElement>,
    container: HostElement,
    parentComponent: ParentComponent,
    anchor: Nullable<HostElement>,
  ) {
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;

    // 如何获取el，走 patchElement 即 n1 已经渲染好，所以 el 即为 n1.el
    const el = (n2.el = n1.el)!;
    patchProps(el, oldProps, newProps);
    patchChildren(n1, n2, el, parentComponent, anchor);
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
  function patchChildren(
    n1: VNODE<HostElement>,
    n2: VNODE<HostElement>,
    container: HostElement,
    parentComponent: ParentComponent,
    anchor: Nullable<HostElement>,
  ) {
    const { shapeFlag: oldFlag, el, children: c1 } = n1;
    const { shapeFlag: newFlag, children: c2 } = n2;

    // array | text -> text
    if (newFlag & ShapeFlags.TEXT_CHILDREN) {
      if (oldFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 清空之前的子元素，以渲染好 children[x].el 是有 HostElement 挂载的
        unmountChildren(<VNODE<HostElement>[]>c1, el!);
      }
      if (c1 !== c2) {
        // 设置 text
        hostSetElementText(el!, <string>c2);
      }
    } else {
      // text | array -> array
      if (newFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (oldFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el!, '');
          mountChildren(<VNODE<HostElement>[]>c2, el!, parentComponent, anchor);
        } else {
          // array -> array diff
          patchKeyedChildren(
            <VNODE<HostElement>[]>c1,
            <VNODE<HostElement>[]>c2,
            el!,
            parentComponent,
            anchor,
          );
        }
      }
    }
  }

  function patchKeyedChildren(
    c1: VNODE<HostElement>[],
    c2: VNODE<HostElement>[],
    container: HostElement,
    parentComponent: ParentComponent,
    parentAnchor: Nullable<HostElement>,
  ) {
    const l1 = c1.length;
    const l2 = c2.length;

    let i = 0;
    let e1 = l1 - 1;
    let e2 = l2 - 1;

    function isSameVNodeValue(n1: VNODE, n2: VNODE) {
      return n1.type === n2.type && n1.key === n2.key;
    }

    // 左侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVNodeValue(n1, n2)) {
        // 无需增删，内部 patch 即可
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }

    // 右侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNodeValue(n1, n2)) {
        // 无需增删，内部 patch 即可
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    if (i > e1) {
      // 新增 新节点在原节点基础上有新增
      while (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        patch(null, c2[i], container, parentComponent, anchor);
        i++;
      }
    } else if (i > e2) {
      // 删除 新节点在原节点基础上有删除
      while (i <= e1) {
        hostRemove(c1[i].el!);
        i++;
      }
    } else {
      // 中间部分
      // TODO
    }
  }

  // 移除 VNODE[] 子元素
  function unmountChildren(children: VNODE<HostElement>[], container: HostElement) {
    for (let i = 0; i < children.length; i += 1) {
      const el = children[i].el;
      hostRemove(el!);
    }
  }

  function mountComponent(
    n1: Nullable<VNODE<HostElement>>,
    n2: VNODE<HostElement>,
    container: HostElement,
    parentComponent: ParentComponent,
    anchor: Nullable<HostElement>,
  ) {
    const instance = createComponentInstance(n2, parentComponent);
    setupComponent(instance);
    setupRenderEffect(n2, instance, container, anchor);
  }

  function setupRenderEffect(
    vnode: VNODE<HostElement>,
    instance: ComponentInstance<HostElement>,
    container: HostElement,
    anchor: Nullable<HostElement>,
  ) {
    effect(() => {
      const { proxy } = instance;
      // proxy 代理 setup 的返回值以及 $el $date ... 属性
      const subTree = instance.render.call(proxy);

      if (!instance.isMounted) {
        patch(null, subTree, container, instance, anchor);
        instance.isMounted = true;
      } else {
        console.log('patch');
        const prevTree = instance.subTree;
        patch(prevTree, subTree, container, instance, anchor);
      }

      instance.subTree = subTree;
      vnode.el = subTree.el;
    });
  }

  return {
    createApp: createAppAPI(render),
  };
}
