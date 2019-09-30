/* eslint-disable */
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import vuetify from './plugins/vuetify';
import Vue2TouchEvents from 'vue2-touch-events';
import 'vue-directive-tooltip/dist/vueDirectiveTooltip.css';

const Tooltip = require( 'vue-directive-tooltip');
const VueMousetrap = require('vue-mousetrap');

Vue.use(Tooltip);

Vue.use(VueMousetrap);

Vue.use(Vue2TouchEvents);

Vue.config.productionTip = false;

Vue.filter('percent', (value: any) => `${Math.trunc(value)}%`);

Vue.filter('numbers', (value: any) => {
  const number = value + 1;
  if (number < 10) {
    return `0${number}.`;
  }
  return `${number}.`;
});

Vue.filter('minutes', (value: any) => {
  if (!value || typeof value !== 'number') return '00:00';
  let min = Math.trunc(value / 60);
  let sec = Math.trunc(value % 60);
  let newMin = min < 10 ? `0${min}` : min;
  let newSec = sec < 10 ? `0${sec}` : sec;
  value = `${newMin}:${newSec}`;
  return value;
});

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app');
