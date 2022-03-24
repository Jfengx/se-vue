let activeEffect;
const depsDB = new Map();

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
}

class ReactiveEffect {
  active = true;
  deps = [];
  constructor(private fn, public opts?) {}
  run() {
    activeEffect = this;
    this.active = true;
    return this.fn();
  }
  stop() {
    if (this.active) {
      cleanupEffect(this);
      this.active = false;

      if (this.opts.onStop) {
        this.opts.onStop();
      }
    }
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

  if (!activeEffect) return;

  deps.add(activeEffect);
  activeEffect.deps.push(deps);
}

export function trigger(target, key) {
  const depsMap = depsDB.get(target);
  const deps = depsMap.get(key);

  for (const dep of deps) {
    if (dep.opts.schedular) {
      dep.opts.schedular();
    } else {
      dep.run();
    }
  }
}

export function stop(runner) {
  runner.effect.stop();
}

export function effect(fn, opts: any = {}) {
  // fn 相关操作全部交给 ReactiveEffect
  const effector = new ReactiveEffect(fn, opts);
  effector.run();

  const runner: any = effector.run.bind(effector);
  runner.effect = effector;

  return runner;
}
