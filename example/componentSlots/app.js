import { h, createTextVNode } from '../../lib/se-vue.esm.js';
import { Foo } from './foo.js';

export const App = {
  name: 'App',
  setup() {},
  render() {
    const app = h('p', {}, 'app');
    const foo = h(
      Foo,
      {},
      {
        header: (props) => [h('p', {}, 'header' + props.age), createTextVNode('我是 textnode')],
        footer: (props) => h('p', {}, 'footer'),
      },
    );
    return h('div', {}, [app, foo]);
  },
};
