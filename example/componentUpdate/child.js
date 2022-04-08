import { h, ref } from '../../lib/se-vue.esm.js';

export const Child = {
  name: 'Child',
  setup(props, { emit }) {
    const child = ref('child');
    const onClick = () => {
      child.value = 'new Child';
    };

    return {
      child,
      onClick,
    };
  },
  render() {
    return h('div', {}, [
      h('button', { onClick: this.onClick }, 'child 内更新' + this.child),
      h('div', {}, 'child - props - msg:' + this.$props.msg),
    ]);
  },
};
