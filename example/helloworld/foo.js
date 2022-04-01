import { h } from '../../lib/se-vue.esm.js';

export const Foo = {
  name: 'Foo',
  setup(props) {
    console.log('foo props:', props);
    props.count++;
  },
  render() {
    return h('div', {}, 'foo：' + this.count);
  },
};
