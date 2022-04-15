import { ref } from '../../lib/se-vue.esm.js';

export const App = {
  name: 'App',
  template: `<div>hi,{{ message }}</div>`,
  setup() {
    const message = ref('se-vue');
    window._message = message;
    return {
      message,
    };
  },
};
