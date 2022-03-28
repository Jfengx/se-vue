export const App = {
  render() {
    return h('div', 'hi se-vue' + this.msg);
  },

  setup() {
    return { msg: 'J' };
  },
};
