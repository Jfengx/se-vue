import { createRender } from '../runtime-core/renderer';
import { Component } from '../runtime-core/vnode';

function createElement(type: string) {
  return document.createElement(type);
}

function patchProp(el: HTMLElement, key: string, propValue: any) {
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, propValue);
  }
  el.setAttribute(key, propValue);
}

function insert(el: HTMLElement, container: HTMLElement) {
  container.appendChild(el);
}

const renderer = createRender({
  createElement,
  patchProp,
  insert,
});

export function createApp(rootComponent: Component) {
  return renderer.createApp(rootComponent);
}

export * from '../runtime-core';
