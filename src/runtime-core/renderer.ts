import { VNODE, Fragment, Text } from './vnode';
import { ComponentInstance, createComponentInstance, setupComponent } from './component';
import { ShapeFlags } from '../shared/shapeFlags';
import { createAppAPI } from './createApp';
import { effect } from '../reactivity/effect';
import { EMPTY_OBJ } from '../shared';
import { queueJobs } from './scheduler';
import { shouldUpdateComponent } from './componentUpdateUtils';

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
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor);
    } else {
      updateComponent(n1, n2);
    }
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

  function mountComponent(
    n2: VNODE<HostElement>,
    container: HostElement,
    parentComponent: ParentComponent,
    anchor: Nullable<HostElement>,
  ) {
    const instance = (n2.component = createComponentInstance(n2, parentComponent));
    setupComponent(instance);
    setupRenderEffect(n2, instance, container, anchor);
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
        unmountChildren(<VNODE<HostElement>[]>c1);
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
      // 1. 删除多余的节点（即 c2 有，c1 无）
      // 2. 更新两者都有的节点（c2，c1 重合部分）
      // 3. 调整重合节点的顺序 同时 创建新增的点
      const s1 = i;
      const s2 = i;
      const toBePatched = e2 - s2 + 1;
      let patched = 0;

      // 存储新数组对应旧数组的下标，以便调整顺序
      const newIndexToOldIndexMap = Array(toBePatched).fill(0);
      // 用来优化，判断是否需要 move
      let moved = false;
      let maxNewIndexSoFar = 0;

      const keyToIndexMap = new Map();
      // 获取 c2 的 key，使用 Map 优化查询
      for (let i = s2; i <= e2; i += 1) {
        keyToIndexMap.set(c2[i].key, i);
      }

      let newIndex;
      for (let i = s1; i <= e1; i += 1) {
        const prevChild = c1[i];

        if (patched >= toBePatched) {
          hostRemove(c1[i].el!);
          continue;
        }

        if (prevChild.key != null) {
          // Map 查询
          newIndex = keyToIndexMap.get(prevChild.key);
        } else {
          // 遍历查询
          for (let j = s2; j <= e2; j += 1) {
            if (isSameVNodeValue(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }

        if (newIndex !== undefined) {
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          // !! 更新下标，+1 防止为 0，0 代表的是 c2 有，c1 无的项
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          // 更新相同节点
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched += 1;
        } else {
          // 删除更新后不存在节点
          hostRemove(prevChild.el!);
        }
      }

      // 得出 最长递增项 的下标
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
      // 根据 increasingNewIndexSequence 找出需要移动的项
      let j = increasingNewIndexSequence.length - 1;
      for (let i = toBePatched - 1; i >= 0; i -= 1) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex]!;
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;

        // 若该点没有则新建，然后插入
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el!, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  }

  // 移除 VNODE[] 子元素
  function unmountChildren(children: VNODE<HostElement>[]) {
    for (let i = 0; i < children.length; i += 1) {
      const el = children[i].el;
      hostRemove(el!);
    }
  }

  function updateComponent(n1: VNODE<HostElement>, n2: VNODE<HostElement>) {
    const instance = (n2.component = n1.component);
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update();
    } else {
      n2.el = n1.el;
      instance!.vnode = n2;
    }
  }

  function setupRenderEffect(
    vnode: VNODE<HostElement>,
    instance: ComponentInstance<HostElement>,
    container: HostElement,
    anchor: Nullable<HostElement>,
  ) {
    instance.update = effect(
      () => {
        if (!instance.isMounted) {
          console.log('Component -> init');
          const { proxy } = instance;
          // proxy 代理 setup 的返回值以及 $el $date ... 属性
          const subTree = (instance.subTree = instance.render.call(proxy));
          patch(null, subTree, container, instance, anchor);
          vnode.el = subTree.el;
          instance.isMounted = true;
        } else {
          console.log('Component -> patch');
          // 需要一个 vnode
          const { next, vnode } = instance;
          if (next) {
            next.el = vnode.el;
            updateComponentPreRender(instance, next);
          }
          const { proxy } = instance;
          // proxy 代理 setup 的返回值以及 $el $date ... 属性
          const subTree = instance.render.call(proxy);
          const prevTree = instance.subTree;
          instance.subTree = subTree;
          patch(prevTree, subTree, container, instance, anchor);
        }
      },
      {
        schedular: () => {
          console.log('update - scheduler');
          queueJobs(instance.update);
        },
      },
    );
  }

  function updateComponentPreRender(instance: ComponentInstance, nextVNode: VNODE) {
    instance.vnode = nextVNode;
    instance.next = null;
    instance.props = nextVNode.props;
  }

  // Fragment
  function processFragment(
    n1: Nullable<VNODE<HostElement>>,
    n2: VNODE<HostElement>,
    container: HostElement,
    parentComponent: ParentComponent,
    anchor: Nullable<HostElement>,
  ) {
    mountChildren(<VNODE<HostElement>[]>n2.children, container, parentComponent, anchor);
  }

  // TextNode
  function processText(n1: Nullable<VNODE>, n2: VNODE, container: HostElement) {
    // TODO
    const el: unknown = document.createTextNode(<string>n2.children);
    hostInsert(<HostElement>el!, container, null);
  }

  return {
    createApp: createAppAPI(render),
  };
}

// 求 最长递增子序列在原数组的下标 数组
function getSequence(arr: number[]): number[] {
  // 浅拷贝arr
  const _arr = arr.slice();
  const len = _arr.length;
  // 存储最长递增子序列对应arr中下标
  const result = [0];

  for (let i = 0; i < len; i++) {
    const val = _arr[i];

    // 排除等于 0 的情况
    if (val !== 0) {
      /* 1. 贪心算法 */

      // 获取result当前最大值的下标
      const j = result[result.length - 1];
      // 如果当前 val 大于当前递增子序列的最大值的时候，直接添加
      if (arr[j] < val) {
        _arr[i] = j; // 保存上一次递增子序列最后一个值的索引
        result.push(i);
        continue;
      }

      /* 2. 二分法 */

      // 定义二分法查找区间 [left, right]
      let left = 0;
      let right = result.length - 1;
      while (left < right) {
        // 求中间值（向下取整）
        const mid = (left + right) >> 1;
        if (arr[result[mid]] < val) left = mid + 1;
        else right = mid;
      }

      // 当前递增子序列按顺序找到第一个大于 val 的值，将其替换
      if (val < arr[result[left]]) {
        if (left > 0) {
          // 保存上一次递增子序列最后一个值的索引
          _arr[i] = result[left - 1];
        }

        // 此时有可能导致结果不正确，即 result[left + 1] < result[left]
        // 所以我们需要通过 _arr 来记录正常的结果
        result[left] = i;
      }
    }
  }

  // 修正贪心算法可能造成最长递增子序列在原数组里不是正确的顺序
  let len2 = result.length;
  let idx = result[len2 - 1];
  // 倒序回溯，通过之前 _arr 记录的上一次递增子序列最后一个值的索引
  // 进而找到最终正确的索引
  while (len2-- > 0) {
    result[len2] = idx;
    idx = _arr[idx];
  }

  return result;
}
