import { h, ref, reactive } from '../../lib/se-vue.esm.js';

export const App = {
  name: 'App',
  setup() {
    const count = ref(0);
    const add = () => {
      console.log(count);
      count.value++;
    };

    const props = ref({
      foo: 'foo',
      bar: 'bar',
    });

    const changeProps0 = () => {
      props.value.foo = 'foo-new';
    };
    const changeProps1 = () => {
      props.value.foo = undefined;
    };
    const changeProps2 = () => {
      props.value = {
        foo: 'foo',
      };
    };

    return {
      count,
      add,
      props,
      changeProps0,
      changeProps1,
      changeProps2,
    };
  },
  render() {
    return h('div', { id: 'root', ...this.props }, [
      h('div', {}, 'count：' + this.count),
      h('button', { onClick: this.add }, 'add '),
      h('button', { onClick: this.changeProps0 }, '改变Props -> foo: new-foo'),
      h('button', { onClick: this.changeProps1 }, '改变Props -> foo: undefined'),
      h('button', { onClick: this.changeProps2 }, '改变Props -> 删除 bar '),
    ]);
  },
};
