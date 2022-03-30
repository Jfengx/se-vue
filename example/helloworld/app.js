import { h } from '../../lib/se-vue.esm.js';

export const App = {
  render() {
    return h('div', 'hi se-vue' + this.msg);
  },

  setup() {
    return { msg: 'J' };
  },
};
