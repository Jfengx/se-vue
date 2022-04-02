import { h } from '../../lib/se-vue.esm.js';
import { renderSlots } from '../../lib/se-vue.esm.js';

export const Foo = {
  name: 'Foo',
  setup() {},
  render() {
    const age = 18;
    const foo = h('p', {}, 'foo');
    return h('div', {}, [
      renderSlots(this.$slots, 'header', {
        age,
      }),
      foo,
      renderSlots(this.$slots, 'footer'),
    ]);
  },
};
