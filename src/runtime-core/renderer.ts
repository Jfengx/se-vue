import { VNODE, Fragment, Text } from './vnode';
import { ComponentInstance, createComponentInstance, setupComponent } from './component';
import { ShapeFlags } from '../shared/shapeFlags';

export type ParentComponent = ComponentInstance | undefined;

export function render(vnode, container, parentComponent?: ParentComponent) {
  patch(vnode, container, parentComponent);
}

function patch(vnode: VNODE, container: HTMLElement, parentComponent: ParentComponent) {
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

function processElement(vnode: VNODE, container, parentComponent: ParentComponent) {
  mountElement(vnode, container, parentComponent);
}

function processComponent(vnode: VNODE, container: HTMLElement, parentComponent: ParentComponent) {
  mountComponent(vnode, container, parentComponent);
}

function processFragment(vnode: VNODE, container: HTMLElement, parentComponent: ParentComponent) {
  mountChildren(<VNODE[]>vnode.children, container, parentComponent);
}

function processText(vnode: VNODE, container: HTMLElement) {
  const el = document.createTextNode(<string>vnode.children);
  container.append(el);
}

function mountElement(vnode: VNODE, container: HTMLElement, parentComponent: ParentComponent) {
  const el = (vnode.el = document.createElement(<string>vnode.type));
  const { children, props, shapeFlag } = vnode;

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = <string>children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(<VNODE[]>children, el, parentComponent);
  }

  for (const key in props) {
    const val = props[key];
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, val);
    }
    el.setAttribute(key, val);
  }

  container.appendChild(el);
}

function mountChildren(
  children: VNODE[],
  container: HTMLElement,
  parentComponent: ParentComponent,
) {
  children.forEach((child) => {
    patch(child, container, parentComponent);
  });
}

function mountComponent(vnode: VNODE, container: HTMLElement, parentComponent: ParentComponent) {
  const instance = createComponentInstance(vnode, parentComponent);
  setupComponent(instance);
  setupRenderEffect(vnode, instance, container);
}

function setupRenderEffect(vnode: VNODE, instance: ComponentInstance, container: HTMLElement) {
  const { proxy } = instance;
  // proxy 代理 setup 的返回值以及 $el $date ... 属性
  const subTree = instance.render.call(proxy);
  patch(subTree, container, instance);

  vnode.el = subTree.el;
}
