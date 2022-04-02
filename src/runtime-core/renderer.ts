import { VNODE, Fragment } from './vnode';
import { ComponentInstance, createComponentInstance, setupComponent } from './component';
import { ShapeFlags } from '../shared/shapeFlags';

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode: VNODE, container: HTMLElement) {
  const { shapeFlag, type } = vnode;

  switch (type) {
    // Fragment 只渲染 children
    case Fragment:
      processFragment(vnode, container);
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // 处理 'div' 'span' 等字符串类型
        processElement(vnode, container);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 处理 Component 类型
        processComponent(vnode, container);
      }
      break;
  }
}

function processElement(vnode: VNODE, container) {
  mountElement(vnode, container);
}

function processComponent(vnode: VNODE, container: HTMLElement) {
  mountComponent(vnode, container);
}

function processFragment(vnode: VNODE, container: HTMLElement) {
  mountChildren(<VNODE[]>vnode.children, container);
}

function mountElement(vnode: VNODE, container: HTMLElement) {
  const el = (vnode.el = document.createElement(<string>vnode.type));
  const { children, props, shapeFlag } = vnode;

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = <string>children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(<VNODE[]>children, el);
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

function mountChildren(children: VNODE[], container: HTMLElement) {
  children.forEach((child) => {
    patch(child, container);
  });
}

function mountComponent(vnode: VNODE, container: HTMLElement) {
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(vnode, instance, container);
}

function setupRenderEffect(vnode: VNODE, instance: ComponentInstance, container: HTMLElement) {
  const { proxy } = instance;
  // proxy 代理 setup 的返回值以及 $el $date ... 属性
  const subTree = instance.render.call(proxy);
  patch(subTree, container);

  vnode.el = subTree.el;
}
