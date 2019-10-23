import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersist from 'vuex-persist';

const vuexPersist = new VuexPersist({
  key: 'IMP101',
  storage: window.localStorage,
});

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isFirstTime: true,
    isFullScreen: false,
    isMiniMode: false,
    loadDir: '',
    version: 0,
  },
  mutations: {
    setFullscreen(state:any, value) {
      state.isFullScreen = value;
    },
    setMiniMode(state, value) {
      state.isMiniMode = value;
    },
    setLoadDir(state, value) {
      state.loadDir = value;
    },
    setFirstTime(state, value) {
      state.isFirstTime = value;
    },
    setVersion(state, value) {
      state.version = value;
    },
  },
  actions: {
    setFullscreen(context, value) {
      context.commit('setFullscreen', value);
    },
    setMiniMode(context, value) {
      context.commit('setMiniMode', value);
    },
    setLoadDir(context, value) {
      context.commit('setLoadDir', value);
    },
    setFirstTime(context, value) {
      context.commit('setFirstTime', value);
    },
    setVersion(context, value) {
      context.commit('setVersion', value);
    },
  },
  plugins: [vuexPersist.plugin],
});
