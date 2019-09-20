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
      <div id="equalizer">
        <!-- Here be equalizer sliders -->
      </div>
      <div id="waveform"></div>
    </div>
    <v-toolbar dark dense>
      <v-spacer></v-spacer>
      <v-btn text icon @click="toggleMute">
        <template v-if="!this.muted">
          <v-icon v-if="this.volume >= 0.7">mdi-volume-high</v-icon>
          <v-icon v-else-if="this.volume >= 0.3">mdi-volume-medium</v-icon>
          <v-icon v-else-if="this.volume > 0">mdi-volume-low</v-icon>
          <v-icon v-else>mdi-volume-off</v-icon>
        </template>
        <v-icon v-show="this.muted">mdi-volume-off</v-icon>
      </v-btn>
      <v-slider v-model="volume" @input="updateVolume(volume)" max="1" step="0.01"></v-slider>
      <span>{{Math.trunc(this.volume * 100 )+ '%'}}</span>
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
    shuffle: Boolean,
    track: Object
  },
  data: () => ({
    volume: 0.7,
    muted: false,
    wavesurfer: null,
    dirty: false,
    loop: false
  }),
  mounted: function() {
    if (!this.wavesurfer) {
      this.createWaveSurfer();
      if (this.track) {
        this.loadTrack(this.track.url);
      }
      this.wavesurfer.on("ready", () => {
        this.createEq();

        if (this.dirty) {
          this.wavesurfer.play();
        }
      });

      this.wavesurfer.on("error", () => {
        console.warn(e);
      });

      this.wavesurfer.on("finish", () => {
        if (this.loop) {
          this.rewind();
        } else {
          this.skipTrack("next");
        }
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
    createEq() {
      var EQ = [
        {
          f: 32,
          type: "lowshelf"
        },
        {
          f: 64,
          type: "peaking"
        },
        {
          f: 125,
          type: "peaking"
        },
        {
          f: 250,
          type: "peaking"
        },
        {
          f: 500,
          type: "peaking"
        },
        {
          f: 1000,
          type: "peaking"
        },
        {
          f: 2000,
          type: "peaking"
        },
        {
          f: 4000,
          type: "peaking"
        },
        {
          f: 8000,
          type: "peaking"
        },
        {
          f: 16000,
          type: "highshelf"
        }
      ];

      // Create filters
      var filters = EQ.map(band => {
        var filter = this.wavesurfer.backend.ac.createBiquadFilter();
        filter.type = band.type;
        filter.gain.value = 0;
        filter.Q.value = 1;
        filter.frequency.value = band.f;
        return filter;
      });

      // Connect filters to wavesurfer
      this.wavesurfer.backend.setFilters(filters);

      // Bind filters to vertical range sliders
      var container = document.querySelector("#equalizer");
      while (container.firstChild) container.removeChild(container.firstChild);
      filters.forEach(filter => {
        var input = document.createElement("input");
        this.wavesurfer.util.extend(input, {
          type: "range",
          min: -40,
          max: 40,
          value: 0,
          title: filter.frequency.value
        });
        input.style.display = "inline-block";
        input.setAttribute("orient", "vertical");
        this.wavesurfer.util.style(input, {
          webkitAppearance: "slider-vertical",
          width: "50px",
          height: "150px"
        });
        container.appendChild(input);

        var onChange = function(e) {
          filter.gain.value = ~~e.target.value;
        };

        input.addEventListener("input", onChange);
        input.addEventListener("change", onChange);
      });
      // For debugging
      this.wavesurfer.filters = filters;
    },
    loadTrack(track) {
      this.wavesurfer.load(track);
    },
    playTrack() {
      if (!this.dirty) {
        this.$emit("playtrack", this.isPlaying);
      }
      this.dirty = true;
      this.wavesurfer.playPause();
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
      this.$emit("toggleshuffle", !this.shuffle);
    }
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
      if (!this.dirty) {
        this.dirty = true;
        this.loadTrack(this.track.url);
      }
    }
  }
};
</script>