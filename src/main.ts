import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import vuetify from './plugins/vuetify';
import Vue2TouchEvents from 'vue2-touch-events';
import VueMousetrap from 'vue-mousetrap';
import Tooltip from 'vue-directive-tooltip';
import 'vue-directive-tooltip/dist/vueDirectiveTooltip.css';

Vue.use(Tooltip);

Vue.use(VueMousetrap);

Vue.use(Vue2TouchEvents);

Vue.config.productionTip = false;

Vue.filter('percent', (value: number) => `${Math.trunc(value)}%`);

Vue.filter('numbers', (value: number) => {
  const number = value + 1;
  if (number < 10) {
    return `0${number}.`;
  }
  return `${number}.`;
});

Vue.filter('minutes', (value: string | number) => {
  if (!value || typeof value !== 'number') return '00:00';
  let min = parseInt(value / 60);
  let sec = parseInt(value % 60);
  min = min < 10 ? `0${min}` : min;
  sec = sec < 10 ? `0${sec}` : sec;
  value = `${min}:${sec}`;
  return value;
});

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app');
