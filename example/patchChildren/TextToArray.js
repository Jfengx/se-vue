import { h, ref } from '../../lib/se-vue.esm.js';

const nextChildren = [h('div', {}, 'a'), h('div', {}, 'b')];
const prevChildren = 'newChildren';

export const TextToArray = {
  name: 'TextToArray',
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
