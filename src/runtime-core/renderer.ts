import { isObject } from '../shared/index';
import { VNODE, Component } from './vnode';

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode: VNODE, container: HTMLElement) {
  debugger;
  if (typeof vnode.type === 'string') {
    // 处理 'div' 'span' 等字符串类型
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    // 处理 Component 类型
    processComponent(vnode, container);
  }
}

function processElement(vnode: VNODE, container) {
  mountElement(vnode, container);
}

function processComponent(vnode: VNODE, container: HTMLElement) {
  mountComponent(vnode, container);
}

function mountElement(vnode: VNODE, container: HTMLElement) {
  const el = document.createElement(<string>vnode.type);
  const { children, props } = vnode;

  if (typeof children === 'string') {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    mountChildren(children, el);
  }

  for (const key in props) {
    const val = props[key];
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
  const { render } = <Component>vnode.type;
  const subTree = render();
  patch(subTree, container);
}
