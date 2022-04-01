import { h } from '../../lib/se-vue.esm.js';
import { Foo } from './foo.js';

export const App = {
  name: 'App',
  setup() {
    const onAdd = () => {
      console.log('onAdd');
    };
    const onAddFoo = () => {
      console.log('onAddFoo');
    };
    const onMinus = (a, b, c) => {
      console.log('onMinus', a, b, c);
    };
    return { msg: 'J', onAdd, onAddFoo, onMinus };
  },
  render() {
    return h('div', {}, [
      h('p', {}, 'hi' + this.msg),
      h(Foo, {
        count: 1,
        onAdd: this.onAdd,
        onAddFoo: this.onAddFoo,
        onMinus: this.onMinus,
      }),
    ]);
  },
};
