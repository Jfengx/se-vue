import { getCurrentInstance } from './component';

export function provide(key: string, value) {
  const currentInstance = getCurrentInstance();

  if (currentInstance) {
    let { provides } = currentInstance;
    provides[key] = value;
  }
  console.log(currentInstance);
}

export function inject(key: string) {
  const currentInstance = getCurrentInstance();

  if (currentInstance) {
    const { parent } = currentInstance;
    if (parent) {
      return parent.provides[key];
    }
  }
}
