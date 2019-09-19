<template>
  <div>
    <v-toolbar flat height="90">
      <v-spacer></v-spacer>
      <v-btn v-if="!playing" outlined fab small color="light-blue" @click="skipTrack('prev')">
        <v-icon>mdi-rewind</v-icon>
      </v-btn>
      <v-btn v-else outlined fab small color="light-blue" @click="stopTrack()">
        <v-icon>mdi-rewind</v-icon>
      </v-btn>
      <v-btn v-if="!playing" fab color="light-blue" @click="playTrack()">
        <v-icon large>mdi-play</v-icon>
      </v-btn>
      <v-btn v-else outlined fab color="light-blue" @click="pauseTrack">
        <v-icon>mdi-pause</v-icon>
      </v-btn>
      <v-btn outlined fab small color="light-blue" @click="skipTrack('next')">
        <v-icon>mdi-fast-forward</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-toolbar flat height="40">
      <v-progress-linear height="40" v-model="trackProgress" ></v-progress-linear>
    </v-toolbar>
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
export default {
  props: {
    playing: Boolean,
    loop: Boolean,
    shuffle: Boolean,
    progress: Number
  },
  data: () => ({
    volume: 0.7,
    muted: false
  }),
  created: function() {
    Howler.volume(this.volume);
  },
  methods: {
    playTrack(index) {
      this.$emit("playtrack", index);
    },
    pauseTrack() {
      this.$emit("pausetrack");
    },
    stopTrack() {
      this.$emit("stoptrack");
    },
    skipTrack(direction) {
      this.$emit("skiptrack", direction);
    },
    updateVolume(volume) {
      Howler.volume(volume);
    },
    toggleMute() {
      Howler.mute(!this.muted);
      this.muted = !this.muted;
    },
    toggleLoop() {
      this.$emit("toggleloop", !this.loop);
    },
    toggleShuffle() {
      this.$emit("toggleshuffle", !this.shuffle);
    }
  },
  computed: {
    trackProgress: {
      get: function() {
        return this.progress * 100;
      },
      set: function(newValue) {
        this.$emit("updateseek", newValue);
      }
    }
  }
};
</script>