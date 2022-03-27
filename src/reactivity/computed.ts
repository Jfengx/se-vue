import { ReactiveEffect } from './effect';

class ComputedRefImpl {
  private _dirty = true;
  private _value;
  private _effect;

  constructor(private _getter) {
    // 创建 effect 通知是否可以 进行 get value 操作
    this._effect = new ReactiveEffect(this._getter, {
      schedular: () => {
        if (!this._dirty) {
          this._dirty = true;
        }
      },
    });
  }

  get value() {
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter);
}
