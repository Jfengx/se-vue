let activeEffect;
const depsDB = new Map();

class ReactiveEffect {
  constructor(private fn) {}
  run() {
    activeEffect = this;
    return this.fn();
  }
}

export function track(target, key) {
  let depsMap = depsDB.get(target);
  if (!depsMap) {
    depsMap = new Map();
    depsDB.set(target, depsMap);
  }

  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }

  deps.add(activeEffect);
}

export function trigger(target, key) {
  const depsMap = depsDB.get(target);
  const deps = depsMap.get(key);

  for (const dep of deps) {
    dep.run();
  }
}

export function effect(fn) {
  // fn 相关操作全部交给 ReactiveEffect
  const effector = new ReactiveEffect(fn);
  effector.run();
  return effector.run.bind(effector);
}
