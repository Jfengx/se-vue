import { h } from '../../lib/se-vue.esm.js';
import { Foo } from './foo.js';

export const App = {
  name: 'App',
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
      [h('p', {}, 'hi' + this.msg), h(Foo, { count: 1 })],
    );
  },

  setup() {
    return { msg: 'J' };
  },
};
