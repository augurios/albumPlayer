<template>
  <v-app-bar app >
    <v-toolbar-title class="headline text-uppercase">
      <img src="images/logo_transparent.png" alt class="logo" />
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn text href="#" target="_blank">
      <span class="mr-2">Stuff</span>
    </v-btn>
  </v-app-bar>
</template>

<script>
export default {
  data() {
    return {
      appName: 'IMP',
      appSlogan: '101',
    };
  },
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
