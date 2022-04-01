import { h } from '../../lib/se-vue.esm.js';

export const App = {
  render() {
    window.self = this;
    return h(
      'div',
      {
        id: 'root',
        class: 'test',
        onClick() {
          console.log('click');
        },
      },
      'hi,' + this.msg,
      // [h('p', {}, '第一'), h('p', {}, '第二')],
    );
  },

  setup() {
    return { msg: 'J' };
  },
};
