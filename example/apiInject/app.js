import { h, provide, inject } from '../../lib/se-vue.esm.js';

export const App = {
  name: 'App',
  setup() {
    provide('foo', 'fooVal');
    provide('bar', 'barVal');
  },
  render() {
    return h('div', {}, [h('p', {}, 'provide'), h(AppTwo)]);
  },
};

const AppTwo = {
  name: 'AppTwo',
  setup() {
    provide('foo', 'fooValTwo');
    const foo = inject('foo');
    return {
      foo,
    };
  },
  render() {
    return h('div', {}, [h('p', {}, 'provide Two: ' + this.foo), h(Consumer)]);
  },
};

const Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject('foo');
    const bar = inject('bar');
    return {
      foo,
      bar,
    };
  },
  render() {
    return h('div', {}, `consumer: ${this.foo} ${this.bar}`);
  },
};
