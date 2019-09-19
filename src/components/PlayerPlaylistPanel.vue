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
        <v-btn color="light-blue" @click="selectPlay(track,index)">
          <v-icon large>mdi-play</v-icon>
        </v-btn>
        <v-list-item-content @click="selectTrack(track)" @dblclick="playTrack()">
          <v-list-item-title>{{ index | numbers }} {{ track.artist }} - {{ track.title }}</v-list-item-title>
        </v-list-item-content>
        <v-spacer></v-spacer>
        {{ track.howl.duration() | minutes }}
      </v-list-item>
    </v-list>
  </v-card>
</template>
 
<script>
export default {
  props: {
    playlist: Array,
    selectedTrack: Object,
    currentTrack: Object,
  },
  methods: {
    selectTrack(track) {
      this.$emit("selecttrack", track);
    },
    playTrack(index) {
      console.log("play track", index);
      this.$emit("playtrack", index);
    },
    selectPlay(track, index) {
      this.selectTrack(track);
      this.playTrack(index);
    }
  }
};
</script>
<style scoped>
.v-list-item {
  transition: all 0.4s ease;
  cursor: pointer;
  border-left: 3px solid transparent;
  padding-left: 13px;
}

.playlist .v-list-item .v-btn {
  position: absolute;
  left: -4px;
  top: 0;
  bottom: 0;
  height: 100%;
  border-radius: 0;
  opacity: 0;
  transform: translateX(-62px);
  transition: all 0.2s ease;
}

.playlist .v-list-item:hover .v-btn {
  opacity: 1;
  transform: translateX(0px);
}

.playlist .v-list-item .v-list-item__content {
  transform: translateX(0px);
  transition: all 0.2s ease;
}

.playlist .v-list-item:hover .v-list-item__content {
  transform: translateX(62px);
}

.v-list-item:hover {
  background-color: rgba(255, 166, 0, 0.226) !important;
}
.v-list-item.active.active.active {
  border-left: 3px solid #03a8f4cb;
}
.v-list-item.selected.selected.selected {
  background-color: orange !important;
  color: #333 !important;
  
}
.even {
  background-color: #505050;
}
.playlist {
  overflow: auto;
}
</style>