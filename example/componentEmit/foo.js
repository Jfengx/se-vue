import { h } from '../../lib/se-vue.esm.js';

export const Foo = {
  name: 'Foo',
  setup(_, { emit }) {
    const add = () => {
      console.log('emit add');
      emit('add');
      emit('add-foo');
    };
    const minus = () => {
      console.log('emit minus');
      emit('minus', 1, 2, 3);
    };
    return {
      add,
      minus,
    };
  },
  render() {
    const btnAdd = h(
      'button',
      {
        onClick: this.add,
      },
      'emit Add',
    );
    const btnMinus = h(
      'button',
      {
        onClick: this.minus,
      },
      'emit minus',
    );
    const foo = h('p', {}, 'foo');
    return h('div', {}, [foo, btnAdd, btnMinus]);
  },
};
