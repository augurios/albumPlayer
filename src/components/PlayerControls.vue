<template>
  <div>
    <v-toolbar flat height="90">
      <v-spacer></v-spacer>
      <v-btn outlined fab small color="light-blue" @click="rewind()">
        <v-icon>mdi-rewind</v-icon>
      </v-btn>
      <v-btn v-if="!isPlaying" fab color="light-blue" @click="playTrack()">
        <v-icon large>mdi-play</v-icon>
      </v-btn>
      <v-btn v-else outlined fab color="light-blue" @click="playTrack()">
        <v-icon>mdi-pause</v-icon>
      </v-btn>
      <v-btn outlined fab small color="light-blue" @click="skipTrack('next')">
        <v-icon>mdi-fast-forward</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
    </v-toolbar>
    <div class="waveform-wrap">
      <div id="waveform"></div>
    </div>
    <v-toolbar dark dense>
      <v-spacer></v-spacer>
      <v-btn text icon @click="toggleMute">
        <template v-if="!this.muted">
          <v-icon v-if="this.volume >= 0.7">mdi-volume-high</v-icon>
          <v-icon v-else-if="this.volume >= 0.5">mdi-volume-medium</v-icon>
          <v-icon v-else-if="this.volume > 0">mdi-volume-low</v-icon>
          <v-icon v-else>mdi-volume-off</v-icon>
        </template>
        <v-icon v-show="this.muted">mdi-volume-off</v-icon>
      </v-btn>
      <v-slider v-model="volume" @input="updateVolume(volume)" max="1" step="0.1"></v-slider>
      <span>{{this.volume * 100 + '%'}}</span>
      <v-spacer></v-spacer>
      <v-btn text icon @click="toggleLoop">
        <v-icon color="light-blue" v-if="this.loop">mdi-repeat-once</v-icon>
        <v-icon color="blue-grey" v-else>mdi-repeat-once</v-icon>
      </v-btn>
      <v-btn text icon @click="toggleShuffle">
        <v-icon color="light-blue" v-if="this.shuffle">mdi-shuffle</v-icon>
        <v-icon color="blue-grey" v-else>mdi-shuffle</v-icon>
      </v-btn>
    </v-toolbar>
  </div>
</template>
<script>
import WaveSurfer from "wavesurfer.js";

export default {
  props: {
    playing: Boolean,
    loop: Boolean,
    shuffle: Boolean,
    track: Object
  },
  data: () => ({
    volume: 0.7,
    muted: false,
    wavesurfer: null,
    dirty: false
  }),
  mounted: function() {
    if (!this.wavesurfer) {
      this.createWaveSurfer();
      if (this.track) {
        this.loadTrack(this.track.url);
      }
      this.wavesurfer.on("ready", () => {
        if(this.dirty) {
          this.wavesurfer.play();
        }
      });

      this.wavesurfer.on("error", () => {
        console.warn(e);
      });

      this.wavesurfer.on("finish", () => {
        this.skipTrack('next');
      });
    }
  },
  methods: {
    createWaveSurfer() {
      this.wavesurfer = WaveSurfer.create({
        container: "#waveform",
        barWidth: 3
      });
    },
    loadTrack(track) {
      this.wavesurfer.load(track);
    },
    playTrack() {
      this.dirty = true;
      this.wavesurfer.playPause();
      this.$emit("playtrack", this.isPlaying);
    },
    skipTrack(direction) {
      this.dirty = true;
      this.$emit("skiptrack", direction);
    },
    rewind() {
      this.dirty = true;
      if (this.wavesurfer.getCurrentTime() < 3) {
        this.skipTrack("prev");
      } else {
        this.wavesurfer.stop();
        this.wavesurfer.play();
      }
    },
    updateVolume(volume) {},
    toggleMute() {},
    toggleLoop() {},
    toggleShuffle() {}
  },
  computed: {
    isPlaying() {
      if (!this.wavesurfer) return false;
      return this.wavesurfer.isPlaying();
    }
  },
  watch: {
    track: function(newTrack) {
      this.dirty = true;
      this.loadTrack(newTrack.url);
    },
    playing: function() {
      if(!this.dirty) {
        this.dirty = true;
        this.loadTrack(this.track.url);
      }
      
    },
  }
};
</script>