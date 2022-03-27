let activeEffect;
let shouldTrack;
const depsDB = new Map();

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });

  effect.deps.length = 0;
}

export class ReactiveEffect {
  active = true;
  deps = [];
  constructor(private fn, public opts?) {}
  run() {
    if (!this.active) {
      return this.fn();
    }
    // 可以收集依赖
    activeEffect = this;
    shouldTrack = true;
    const result = this.fn();

    // 只在函数执行期内执行收集依赖
    shouldTrack = false;

    return result;
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

export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

export function trackEffects(deps) {
  // 避免 activeEffect.deps 重复收集， deps 是 Set 会自动去
  if (deps.has(activeEffect)) return;
  deps.add(activeEffect);
  activeEffect.deps.push(deps);
}

export function track(target, key) {
  if (!isTracking()) return;

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

  trackEffects(deps);
}

export function triggerEffects(deps) {
  for (const dep of deps) {
    if (dep.opts?.schedular) {
      dep.opts.schedular();
    } else {
      dep.run();
    }
  }
}

export function trigger(target, key) {
  const depsMap = depsDB.get(target);
  if (!depsMap) return;
  const deps = depsMap.get(key);

  triggerEffects(deps);
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
