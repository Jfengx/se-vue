import { h, getCurrentInstance } from '../../lib/se-vue.esm.js';

export const Foo = {
  name: 'Foo',
  setup() {
    const instance = getCurrentInstance();
    console.log('Foo:', instance);
  },
  render() {
    const app = h('div', {}, 'Foo');
    return app;
  },
};
