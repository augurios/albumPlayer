<template>
  <v-card class="playlist">
    <v-list>
      <v-list-item
        v-for="(track, index) in playlist"
        :key="track.title"
        v-show="track.display"
        :class="[
        {selected: track === selectedTrack},
        {active: track === currentTrack},
        {even: index % 2 == 0}]"
        :id="`song-item-${track.indexId}`"
        v-ripple
      >
        <v-btn color="teal lighten-2" @click="selectPlay(track,index)" v-if="!currentMark(track)">
          <v-icon large>mdi-play</v-icon>
        </v-btn>
        <v-btn text class="playing-btn" v-else>
          <v-icon large>mdi-speaker-wireless</v-icon>
        </v-btn>
        <v-list-item-content @click="selectTrack(track)" @dblclick="playTrack(index, track)">
          <v-list-item-title>
            <img
              v-if="track.cover"
              :src="`data:${track.tags.picture.format};base64,${track.cover}`"
            />
            <img src="/images/icon_placerholder.png" v-else />
            <span v-if="track.tags.title">{{ track.tags.title }}</span>
            <span v-else>{{ index | numbers }} {{ track.title }}</span>
          </v-list-item-title>
        </v-list-item-content>
        <v-spacer></v-spacer>
        <span v-if="track.tags" class="cell">{{ track.tags.artist }}</span>
        <v-spacer></v-spacer>
        {{ track.duration | minutes }}
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script>
import EventBus from '../event-bus';

export default {
  props: {
    playlist: Array,
    selectedTrack: Object,
    currentTrack: Object,
    playing: Boolean,
  },
  methods: {
    selectTrack(track) {
      this.$emit('selecttrack', track);
    },
    playTrack(index, track) {
      this.$emit('playtrack', index);
      EventBus.$emit('playtrack', track);
      this.initiateScroll(track);
    },
    selectPlay(track, index) {
      this.selectTrack(track);
      this.playTrack(index, track);
    },
    currentMark(track) {
      if (track.indexId === this.currentTrack.indexId && this.playing) {
        return true;
      }
      return false;
    },
    easeInOutQuad(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    },
    scrollTo(element, to, duration) {
      const start = element.scrollTop;
      const change = to - start;
      let currentTime = 0;
      const increment = 20;

      const animateScroll = () => {
        currentTime += increment;
        const val = this.easeInOutQuad(currentTime, start, change, duration);
        element.scrollTop = val;
        if (currentTime < duration) {
          setTimeout(animateScroll, increment);
        }
      };
      animateScroll();
    },
    initiateScroll(track) {
      const elem = document.getElementById(`song-item-${track.indexId}`);
      const topPos = elem.offsetTop;
      this.scrollTo(document.getElementById('playlist-panel'), topPos, 600);
    },
  },
  watch: {
    currentTrack(newTrack) {
      this.initiateScroll(newTrack);
    },
  },
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
.playlist .cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 8px;
}
.playlist .v-list-item:after,
.playlist .v-list-item:before {
  content: "";
  height: 1px;
  width: 100%;
  position: absolute;
  z-index: 20;
  opacity: 1 !important;
}

.playlist .v-list-item:before {
  top: 0px;
  background: #ffffff1f;
}

.playlist .v-list-item:after {
  bottom: 0px;
  background: #00000038;
}

.playlist .v-list-item__content {
  padding: 22px 0;
  min-width: 60%;
}

.playlist .v-list-item__content:before,
.playlist .v-list-item__content:after {
  content: "";
  width: 1px;
  position: absolute;
  z-index: 20;
  opacity: 1 !important;
  background: #ffffff1f;
  height: 100%;
}

.playlist .v-list-item__content:before {
  left: 0;
}

.playlist .v-list-item__content:after {
  right: 0;
  background: #00000021;
  z-index: 100;
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
  opacity: 0.6;
}

.playlist .v-list-item.selected img {
  background: #000;
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
