import { createApp } from '../../lib/se-vue.esm.js';
import { App } from './app.js';

const root = document.querySelector('#app');
createApp(App).mount(root);
