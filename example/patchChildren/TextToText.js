import { h, ref } from '../../lib/se-vue.esm.js';

const prevChildren = 'oldChildren';
const nextChildren = 'newChildren';

export const TextToText = {
  name: 'TextToText',
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
