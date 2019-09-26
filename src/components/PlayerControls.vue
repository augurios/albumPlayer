<template>
  <div class="player-controls">
    <div
      class="player-controls-equ"
      v-bind:class="{ active: eqActive }"
      v-touch:swipe.bottom="toggleEq"
    >
      <v-row justify="center">
        <v-col cols="12">
          <v-card class="eq-card">
            <v-row justify="center" class="eq-row">
              <v-col v-for="(eqControl, index) in eQ" :key="index" sm="1" md="1" cols="1">
                <v-slider
                  v-model="eqControl.value"
                  max="40"
                  min="-40"
                  vertical
                  thumb-label
                  color="teal lighten-2"
                  :label="getString(eqControl.f)"
                  @input="setFilter($event, index)"
                ></v-slider>
              </v-col>
            </v-row>
          </v-card>
          <v-card>
            <v-layout>
              <v-row>
                <v-col justify="center" cols="2">
                  <v-btn text icon @click="toggleMute">
                    <template v-if="!this.muted">
                      <v-icon v-if="this.volume >= 0.7">mdi-volume-high</v-icon>
                      <v-icon v-else-if="this.volume >= 0.3">mdi-volume-medium</v-icon>
                      <v-icon v-else-if="this.volume > 0">mdi-volume-low</v-icon>
                      <v-icon v-else>mdi-volume-off</v-icon>
                    </template>
                    <v-icon v-show="this.muted">mdi-volume-off</v-icon>
                  </v-btn>
                </v-col>
                <v-col cols="10">
                  <v-slider
                    v-model="volume"
                    @input="updateVolume(volume)"
                    max="1"
                    step="0.01"
                    color="teal lighten-2"
                    thumb-label
                  ></v-slider>
                </v-col>
              </v-row>
            </v-layout>
          </v-card>
        </v-col>
      </v-row>
    </div>
    <div v-touch:swipe.top="toggleEq">
      <div
        class="waveform-wrap"
        v-touch:swipe.right="()=>{this.wavesurfer.skipForward()}"
        v-touch:swipe.left="()=>{this.wavesurfer.skipBackward()}"
      >
        <div id="waveform"></div>
        <div class="times-display">
          <span class="current">{{ times.current | minutes}}</span> /
          <span class="duration">{{ times.duration | minutes}}</span>
        </div>
        <v-progress-linear
        indeterminate
        color="teal lighten-2"
        v-if="isLoading">
        </v-progress-linear>
        <v-btn text icon @click="toggleEq">
          <v-icon color="teal lighten-2" v-if="this.eqActive">mdi-equalizer</v-icon>
          <v-icon color="blue-grey" v-else>mdi-equalizer</v-icon>
        </v-btn>
      </div>

      <v-toolbar
        flat
        height="90"
        v-touch:swipe.right="()=>{this.skipTrack('prev')}"
        v-touch:swipe.left="()=>{this.skipTrack('next')}"
      >
        <v-btn text icon @click="toggleLoop">
          <v-icon color="teal lighten-2" v-if="this.loop">mdi-repeat-once</v-icon>
          <v-icon color="blue-grey" v-else>mdi-repeat-once</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn outlined fab small color="teal lighten-2" @click="rewind()">
          <v-icon>mdi-rewind</v-icon>
        </v-btn>
        <v-btn
          v-if="!isPlaying"
          fab
          class="ml-2 mr-2"
          color="teal lighten-2"
          @click="playTrack()"
          :disabled="isLoading"
        >
          <v-icon large>mdi-play</v-icon>
        </v-btn>
        <v-btn v-else outlined fab class="ml-2 mr-2" color="teal lighten-2" @click="playTrack()">
          <v-icon>mdi-pause</v-icon>
        </v-btn>
        <v-btn outlined fab small color="teal lighten-2" @click="skipTrack('next')">
          <v-icon>mdi-fast-forward</v-icon>
        </v-btn>
        <v-spacer></v-spacer>

        <v-btn text icon @click="toggleShuffle">
          <v-icon color="teal lighten-2" v-if="this.shuffle">mdi-shuffle</v-icon>
          <v-icon color="blue-grey" v-else>mdi-shuffle</v-icon>
        </v-btn>
      </v-toolbar>
    </div>
    <v-snackbar
      v-model="snackbarError"
      color="red"
    >
      {{ snackbarErrorText }}
      <v-btn
        color="black"
        text
        @click="snackbarError = false"

      >
        Close
      </v-btn>
    </v-snackbar>
  </div>
</template>
<script>
import WaveSurfer from 'wavesurfer.js';

export default {
  props: {
    playing: Boolean,
    shuffle: Boolean,
    track: Object,
  },
  data: () => ({
    volume: 0.7,
    muted: false,
    wavesurfer: null,
    dirty: false,
    initial: true,
    loop: false,
    eQ: [
      {
        f: 32,
        type: 'lowshelf',
        value: 0,
      },
      {
        f: 64,
        type: 'peaking',
        value: 0,
      },
      {
        f: 125,
        type: 'peaking',
        value: 0,
      },
      {
        f: 250,
        type: 'peaking',
        value: 0,
      },
      {
        f: 500,
        type: 'peaking',
        value: 0,
      },
      {
        f: 1000,
        type: 'peaking',
        value: 0,
      },
      {
        f: 2000,
        type: 'peaking',
        value: 0,
      },
      {
        f: 4000,
        type: 'peaking',
        value: 0,
      },
      {
        f: 8000,
        type: 'peaking',
        value: 0,
      },
      {
        f: 16000,
        type: 'highshelf',
        value: 0,
      },
    ],
    eqActive: false,
    times: {
      current: 0,
      duration: '0',
    },
    isLoading: false,
    updateSeek: null,
    snackbarError: false,
    snackbarErrorText: '',
  }),
  mounted() {
    if (!this.wavesurfer) {
      this.createWaveSurfer();
      if (this.track) {
        this.loadTrack(this.track.file);
      }
      this.wavesurfer.on('ready', () => {
        this.isLoading = false;
        this.createEq();
        this.times.duration = this.wavesurfer.getDuration();
        this.initial = false;
        if (this.dirty) {
          this.wavesurfer.play();
        }
      });

      this.wavesurfer.on('finish', () => {
        if (this.loop) {
          this.rewind();
        } else {
          this.skipTrack('next');
        }
      });
      this.wavesurfer.on('seek', () => {
        this.setCurrentTime();
      });
      this.wavesurfer.on('error', (e) => {
        console.warn(e);
        this.snackbarError = true;
        this.snackbarErrorText = `${e}, File could be corrupted.`;
        this.isLoading = false;
      });
    }
  },
  methods: {
    createWaveSurfer() {
      if (!this.initial) {
        this.isLoading = true;
      }
      this.wavesurfer = WaveSurfer.create({
        container: '#waveform',
        barWidth: 3,
      });
    },
    createEq() {
      const filters = this.eQ.map((band) => {
        const filter = this.wavesurfer.backend.ac.createBiquadFilter();
        filter.type = band.type;
        filter.gain.value = ~~band.value;
        filter.Q.value = 1;
        filter.frequency.value = band.f;
        return filter;
      });
      this.wavesurfer.backend.setFilters(filters);
      this.wavesurfer.filters = filters;
    },
    loadTrack(track) {
      if (this.track && track) {
        const fileBlob = new Blob([track], this.track.mime);
        this.wavesurfer.loadBlob(fileBlob);
        this.isLoading = true;
      }
    },
    playTrack() {
      if (!this.dirty) {
        if (this.track.file) {
          this.loadTrack(this.track.file);
        }
        this.$emit('playtrack', this.isPlaying);
        this.$emit('selecttrack', this.track);
      }
      this.dirty = true;
      this.wavesurfer.playPause();
    },
    skipTrack(direction) {
      this.dirty = true;
      this.$emit('skiptrack', direction);
    },
    rewind() {
      this.dirty = true;
      if (this.wavesurfer.getCurrentTime() < 3) {
        this.skipTrack('prev');
      } else {
        this.wavesurfer.stop();
        this.wavesurfer.play();
      }
    },
    updateVolume(volume) {
      this.volume = volume;
      if (this.wavesurfer) {
        this.wavesurfer.setVolume(volume);
      }
    },
    toggleMute() {
      this.muted = !this.muted;
      this.wavesurfer.setMute(this.muted);
    },
    toggleLoop() {
      this.loop = !this.loop;
    },
    toggleShuffle() {
      this.$emit('toggleshuffle', !this.shuffle);
    },
    toggleEq() {
      this.eqActive = !this.eqActive;
    },
    setFilter(value, index) {
      const filter = this.wavesurfer.filters[index];
      this.eQ[index].value = value;
      filter.gain.value = ~~value;
    },
    getString(number) {
      return number.toString(10);
    },
    setCurrentTime() {
      this.times.current = this.wavesurfer.getCurrentTime();
    },
  },
  computed: {
    isPlaying() {
      if (!this.wavesurfer) return false;
      return this.wavesurfer.isPlaying();
    },
  },
  watch: {
    track(newTrack) {
      if (newTrack && this.initial) {
        this.initial = false;
      } else if (newTrack && this.dirty) {
        this.loadTrack(newTrack.file);
        this.dirty = true;
      }
    },
    playing(playOn) {
      if (playOn && !this.dirty && this.track.file && !this.isPlaying) {
        this.dirty = true;
        this.loadTrack(this.track.file);
      }
    },
    isPlaying() {
      if (!this.dirty) {
        this.dirty = true;
        this.loadTrack(this.track.file);
      }
      if (this.isPlaying) {
        this.updateSeek = setInterval(() => {
          this.setCurrentTime();
        }, 500);
      } else {
        clearInterval(this.updateSeek);
      }
    },
  },
};
</script>
<style lang="scss">
.waveform-wrap {
  position: relative;
  .v-btn {
    position: absolute;
    bottom: 5px;
    right: 10px;
    z-index: 10;
    text-shadow: 1px 1px 3px #00000069;
  }
  .times-display {
    position: absolute;
    z-index: 10;
    bottom: 4px;
    left: 50%;
    background: #000000cc;
    padding: 3px 15px;
    border-radius: 4px;
    margin-left: -62px;
  }
  .v-progress-linear.theme--dark {
    position: absolute;
    bottom: 0;
  }
}
.player-controls {
  background-color: rgba(42, 42, 42, 0.8);
  &-equ {
    position: absolute;
    bottom: calc(100% - 12px);
    max-height: 0;
    overflow: hidden;
    transition: all 0.6s ease;
    width: 100%;
    &.active {
      max-height: 1024px;
    }
    .eq-card {
      overflow: auto;
      .eq-row {
        min-width: 768px;
        max-width: 1280px;
        margin: 0 auto;
      }
    }
  }
  .v-slider__thumb-label {
    z-index: 1;
  }
}
</style>
