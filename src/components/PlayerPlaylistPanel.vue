<template>
  <v-card class="playlist">
    <v-list>
      <v-list-item
        v-for="(track, index) in playlist"
        :key="track.title"
        v-show="track.display"
        :class="[{selected: track === selectedTrack}, {active: track === currentTrack}, {even: index % 2 == 0}]"
        v-ripple
      >
        <v-btn color="teal lighten-2" @click="selectPlay(track,index)" v-if="track != currentTrack">
          <v-icon large>mdi-play</v-icon>
        </v-btn>
        <v-btn text class="playing-btn" v-else>
          <v-icon large>mdi-speaker-wireless</v-icon>
        </v-btn>
        <v-list-item-content @click="selectTrack(track)" @dblclick="playTrack()">
          <v-list-item-title v-if="track.tags">
            <img :src="getImage(track)" />
            {{ index | numbers }} {{ track.tags.title }} - {{ track.tags.artist }}
          </v-list-item-title>
        </v-list-item-content>
        <!--<v-spacer></v-spacer>
        {{ track.howl.duration() | minutes }}-->
      </v-list-item>
    </v-list>
  </v-card>
</template>
 
<script>
export default {
  props: {
    playlist: Array,
    selectedTrack: Object,
    currentTrack: Object
  },
  methods: {
    selectTrack(track) {
      this.$emit("selecttrack", track);
    },
    playTrack(index) {
      this.$emit("playtrack", index);
    },
    selectPlay(track, index) {
      this.selectTrack(track);
      this.playTrack(index);
    },
    arrayBufferToBase64(buffer) {
      let binary = "";
      let bytes = new Uint8Array(buffer);
      let len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    },
    getImage(track) {
      if (track && track.tags && track.tags.picture) {
        let base64String = this.arrayBufferToBase64(track.tags.picture.data);
        return `data:${track.tags.picture.format};base64,${base64String}`;
      }
      return `/images/logo.png`;
    }
  }
};
</script>
<style scoped>
.playlist .v-list-item {
  transition: all 0.4s ease;
  cursor: pointer;
  padding-left: 0;
  position: relative;
  overflow: hidden;
}
.playlist .v-list-item.theme--dark:after,
.playlist .v-list-item.theme--dark:before  {
  content: "";
  height: 1px;
  width: 100%;
  position: absolute;
  z-index: 20;
}

.playlist .v-list-item.theme--dark:before {
  height: 1px;
  width: 100%;
  position: absolute;
  top: 0px;
  background: #ffffff0a;
  
}

.playlist .v-list-item.theme--dark:after {
  bottom: 0px;
  background: #0000001c;
}

.playlist .v-list-item .v-btn,
.playing-btn {
  position: absolute;
  left: -4px;
  top: 0;
  bottom: 0;
  height: 100%;
  border-radius: 0;
  opacity: 0;
  transform: translateX(-62px);
  transition: all 0.2s ease;
  z-index: 10;
}

.playlist .v-list-item .playing-btn {
  background: #00000073;
}

.playlist .v-list-item img {
  max-width: 64px;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.7;
}

.playlist .v-list-item .v-list-item__title {
  padding-left: 72px;
}

.playlist .v-list-item:hover .v-btn,
.playlist .v-list-item .playing-btn {
  opacity: 1;
  transform: translateX(0px);
}

.v-list-item:hover {
  background-color: rgba(255, 166, 0, 0.226) !important;
}

.v-list-item.selected.selected.selected {
  background-color: orange !important;
  color: #333 !important;
}
.even {
  background-color: #50505073;
}
.playlist {
  overflow: auto;
}
</style>