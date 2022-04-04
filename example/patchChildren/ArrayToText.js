import { h, ref } from '../../lib/se-vue.esm.js';

const nextChildren = 'newChildren';
const prevChildren = [h('div', {}, 'a'), h('div', {}, 'b')];

export const ArrayToText = {
  name: 'ArrayToText',
  setup() {
    const isChange = ref(false);
    const change = () => {
      isChange.value = !isChange.value;
    };

    return {
      isChange,
      change,
    };
  },
  render() {
    return h(
      'div',
      {
        class: ['red', 'black'],
        style: 'background: red;',
        onClick: this.change,
      },
      this.isChange ? nextChildren : prevChildren,
    );
  },
};
