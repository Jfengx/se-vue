import { h } from '../../lib/se-vue.esm.js';

export const App = {
  render() {
    return h(
      'div',
      {
        id: 'root',
        class: ['red', 'blue'],
      },
      [h('p', {}, '第一'), h('p', {}, '第二')],
    );
  },

  setup() {
    return { msg: 'J' };
  },
};
