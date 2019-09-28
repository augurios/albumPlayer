<template>
  <v-app-bar app>
    <v-toolbar-title class="headline text-uppercase">
      <img src="images/logo_transparent.png" alt class="logo" />
    </v-toolbar-title>
    <v-spacer></v-spacer>
  <v-btn color="teal accent-3" text @click="()=>{setFirstTime(true)}">
          <v-icon>mdi-settings</v-icon>
        </v-btn>

    <v-btn
      color="amber darken-1"
      text
      @click="toggleMiniscreen"
      v-if="!isMiniMode && !isFullScreen"
      v-tooltip.bottom="'Enable Mini Mode'"
    >
      <v-icon>mdi-image-size-select-small</v-icon>
    </v-btn>
    <v-btn color="amber darken-1" text @click="toggleMiniscreen" v-else-if="!isFullScreen" v-tooltip.bottom="'Disable Mini Mode'">
      <v-icon>mdi-image-size-select-large</v-icon>
    </v-btn>
    <v-btn v-if="isFullScreen && !isMiniMode" color="amber darken-1" text @click="exitFullscreen" v-tooltip.bottom="'Toggle Fullscreen(f)'">
      <v-icon>mdi-fullscreen-exit</v-icon>
    </v-btn>
    <v-btn v-else-if="!isMiniMode" color="amber darken-1" text @click="goFullscreen" v-tooltip.bottom="'Toggle Fullscreen (F)'">
      <v-icon>mdi-fullscreen</v-icon>
    </v-btn>
    <v-btn color="red lighten-1" text @click="quit">
      <v-icon>mdi-close</v-icon>
    </v-btn>

  </v-app-bar>
</template>

<script>
import { remote } from 'electron';
import { mapState, mapActions } from 'vuex';

export default {
  data() {
    return {
      appName: 'IMP',
      appSlogan: '101',
    };
  },

  mounted() {
    this.$mousetrap.bind('f', () => {
      this.toggleFullscreen(!this.isFullScreen);
      this.getCurrentWindow().setFullScreen(this.isFullScreen);
    }, 'keyup');
  },
  methods: {
    ...mapActions({
      toggleFullscreen: 'setFullscreen',
      setMiniMode: 'setMiniMode',
      setFirstTime: 'setFirstTime',
    }),
    getCurrentWindow() {
      const window = remote.BrowserWindow.getFocusedWindow();
      return window;
    },
    quit() {
      const { app } = remote;
      app.quit();
    },
    goFullscreen() {
      this.toggleFullscreen(true);
      this.getCurrentWindow().setFullScreen(this.isFullScreen);
    },
    exitFullscreen() {
      this.toggleFullscreen(false);
      this.getCurrentWindow().setFullScreen(this.isFullScreen);
    },
    toggleMiniscreen() {
      if (this.isMiniMode) {
        this.getCurrentWindow().setSize(991, 768, true);
        this.getCurrentWindow().setResizable(true);
      } else {
        this.getCurrentWindow().setSize(320, 480, true);
        this.getCurrentWindow().setResizable(false);
      }
      this.setMiniMode(!this.isMiniMode);
    },
  },
  computed: mapState(['isFirstTime', 'isFullScreen', 'isMiniMode']),
};
</script>
<style lang="scss" scoped>
.logo {
  width: 120px;
  margin-top: 7px;
}
.v-toolbar.v-sheet {
  -webkit-app-region: drag;
  background-color: #424242dc;
  backdrop-filter: blur(10px);
}
</style>
