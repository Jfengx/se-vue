import { createRender, Nullable } from '../runtime-core/renderer';
import { Component } from '../runtime-core/vnode';

function createElement(type: string) {
  return document.createElement(type);
}

function patchProp(el: HTMLElement, key: string, oldValue: any, newValue: any) {
  const isOn = (key: string) => /^on[A-Z]/.test(key);

  if (isOn(key)) {
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, newValue);
  }

  el[newValue === undefined || newValue === null ? 'removeAttribute' : 'setAttribute'](
    key,
    newValue,
  );
}

function insert(el: HTMLElement, container: HTMLElement, anchor: Nullable<HTMLElement>) {
  container.insertBefore(el, anchor);
}

function remove(el: HTMLElement) {
  const parent = el.parentNode;
  if (parent) {
    parent.removeChild(el);
  }
}

function setElementText(el: HTMLElement, text: string) {
  el.textContent = text;
}

const renderer = createRender<HTMLElement>({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
});

export function createApp(rootComponent: Component) {
  return renderer.createApp(rootComponent);
}

export * from '../runtime-core';
