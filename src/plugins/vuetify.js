import '@mdi/font/css/materialdesignicons.css';
import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import Touch from 'vuetify/es5/directives/touch'

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
  theme: {
    dark: true,
  },
  directives: {
    Touch
  }
});
