<template>
  <v-dialog v-model="isFirstTime" persistent width="480">
    <v-card>
      <v-card-title class="headline">
        Welcome To
        <span class="amber--text text--darken-3 ml-1 mr-1">IMP101</span>
        <small>
          <em>Alpha</em>
        </small>
      </v-card-title>
      <v-card-text>
        <v-alert
          border="top"
          colored-border
          type="warning"
          elevation="1"
        >Alpha version, there might be some bugs and glitches.</v-alert>
        <img
          src="images/logo_transparent.png"
          alt
          class="logo"
          style="width: 69%;margin: 0px auto 14px;display: block;"
        />
        <p style="text-align: center">
          <strong>Integral Music Player</strong>(IMP) is an open source music player for Digital Music Collectors and high-end audio enthusiasts, focused on simplicity and user experience, built with experimental web technologies.
        </p>

        <p>
          Built with
          <a href="https://electronjs.org/" target="_blank">ElectronJs</a> and
          <a href="https://electronjs.org/" target="_blank">VueJs</a> by
          <a href="https://github.com/augurios" target="_blank">Augurios</a>.
        </p>
        <h4>Planned Fatures</h4>
        <ul>
          <li>A proper MiniMode</li>
          <li>Playlist tools</li>
          <li>ID3 tag Editor</li>
          <li>Playlist Manager</li>
          <li>Remote Control</li>
          <li>Integration with IoT</li>
          <li>Other stuff i probably forgot</li>
          <li>i dont know, want anything???</li>
        </ul>
        <p>
          Please report any issues or let me know if you want some features miedo
          <a
            href="https://github.com/augurios/albumPlayer/issues"
            target="_blank"
          >here</a>
        </p>
      </v-card-text>
      <v-card-actions>
        <div class="flex-grow-1"></div>
        <v-btn color="green darken-1" text @click="()=>{setFirstTime(false)}">Ok!</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { mapState, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState(['isFirstTime']),
  },
  methods: {
    ...mapActions({
      setFirstTime: 'setFirstTime',
    }),
  },
};
</script>
