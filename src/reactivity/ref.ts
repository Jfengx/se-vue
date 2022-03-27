import { hasChanged, isObject } from '../shared/index';
import { trackEffects, isTracking, triggerEffects } from './effect';
import { reactive } from './reactive';

class RefImpl {
  public deps = new Set();
  private __isRef = true;
  private _rawVal;

  constructor(private _val) {
    this._rawVal = _val;
    this._val = convert(_val);
  }

  get value() {
    if (isTracking()) {
      trackEffects(this.deps);
    }
    return this._val;
  }

  set value(val) {
    if (hasChanged(this._rawVal, val)) {
      this._rawVal = val;
      this._val = convert(val);
      triggerEffects(this.deps);
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function ref(val) {
  return new RefImpl(val);
}

export function isRef(val) {
  return !!val.__isRef;
}

export function unRef(val) {
  return isRef(val) ? val.value : val;
}

export function proxyRefs(val) {
  return new Proxy(val, {
    get(target, key) {
      return unRef(target[key]);
    },
    set(target, key, val) {
      if (isRef(target[key]) && !isRef(val)) {
        return (target[key].value = val);
      } else {
        return Reflect.set(target, key, val);
      }
    },
  });
}
