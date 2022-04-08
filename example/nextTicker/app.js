import { h, ref, getCurrentInstance, nextTick } from '../../lib/se-vue.esm.js';

export const App = {
  name: 'App',
  setup() {
    const count = ref(1);
    const instance = getCurrentInstance();

    const onClick = () => {
      for (let i = 0; i < 100; i++) {
        console.log('update');
        count.value = i;
      }
      debugger;
      // 此时因render异步执行，count实际渲染dom还是0
      console.log(instance);

      // 获取渲染后 count为99的dom
      nextTick(() => {
        console.log(instance);
      });
    };

    return {
      count,
      onClick,
    };
  },

  render() {
    const button = h('button', { onClick: this.onClick }, 'update');
    const p = h('p', {}, 'count:' + this.count);
    return h('div', {}, [button, p]);
  },
};
