import { h, getCurrentInstance } from '../../lib/se-vue.esm.js';
import { Foo } from './foo.js';

export const App = {
  name: 'App',
  setup() {
    console.log('setup');
    const instance = getCurrentInstance();

    // 注意📢：
    // 非 debugger 下的 console 的时机是不准确的
    // debugger 下是准确的，当前的 instance 应该是没有挂载 setupStauts 且 instance.vnode.el 也是空
    // 但 log 的时候 setupStauts 和 vnode.el 都是完整值
    // 可以用 instance.vnode.el.innerHTML = 'xxx' 来验证，报错说明没有
    console.log('App:', instance);
    return {
      count: 1,
    };
  },
  render() {
    const app = h('div', {}, [h('p', {}, 'App'), h(Foo)]);
    return app;
  },
};
