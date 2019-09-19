<template>
  <v-app dark>
    <PlayerTitleBar />
    <v-content>
      <v-container :fluid="true">
        <v-row>
          <v-col col="12" sm="12" md="6">
            <PlayerInfoPanel :trackInfo="getTrackInfo" />
          </v-col>
          <v-col col="12" sm="12" md="6">
            <PlayerSearchBar :playlist="playlist" />
            <PlayerPlaylistPanel
              :playlist="playlist"
              :selectedTrack="selectedTrack"
              :currentTrack="currentTrack"
              @selecttrack="selectTrack"
              @playtrack="play"
            />
            <PlayerControls
              :track="currentTrack"
              :selectedTrack="selectedTrack"
              :loop="loop"
              :shuffle="shuffle"
              :playing="playing"
              @playtrack="play"
              @pausetrack="pause"
              @stoptrack="stop"
              @skiptrack="skip"
              @toggleloop="toggleLoop"
              @toggleshuffle="toggleShuffle"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import PlayerTitleBar from "./components/ToolBar";
import PlayerPlaylistPanel from "./components/PlayerPlaylistPanel";
import PlayerControls from "./components/PlayerControls";
import PlayerInfoPanel from "./components/PlayerInfoPanel";
import PlayerSearchBar from "./components/PlayerSearchBar";

export default {
  name: "App",
  components: {
    PlayerTitleBar,
    PlayerPlaylistPanel,
    PlayerControls,
    PlayerInfoPanel,
    PlayerSearchBar
  },
  data: () => ({
    playlist: [
      {
        title: "Dios del design",
        artist: "Malaugurio Ft poizon",
        howl: null,
        url: null,
        display: true
      },
      {
        title: "Dios del design 2",
        artist: "Malaugurio Ft poizon",
        howl: null,
        url: null,
        display: true
      },
      {
        title: "Dios del design 3",
        artist: "Malaugurio Ft poizon",
        howl: null,
        url: null,
        display: true
      },
      {
        title: "Dios del design 4",
        artist: "Malaugurio Ft poizon",
        howl: null,
        url: null,
        display: true
      },
      {
        title: "Spiritual force",
        artist: "Augusto Valerio",
        howl: null,
        url: null,
        display: true
      }
    ],
    selectedTrack: null,
    index: 0,
    playing: false,
    loop: false,
    shuffle: false,
    seek: 0,
    loadedTrack: "./playlist/spiritual_force.mp3"
  }),
  created: function() {
    this.playlist.forEach(track => {
      let file = track.title.replace(/\s/g, "_");
      track.url = `./playlist/${file}.mp3`;
      track.howl = new Howl({
        src: [`./playlist/${file}.mp3`],
        onend: () => {
          if (this.loop) {
            this.play(this.index);
          } else {
            this.skip("next");
          }
        }
      });
    });
    console.log('dsdfsd', this.playlist);
  },
  methods: {
    selectTrack(track) {
      this.selectedTrack = track;
    },
    play(index) {
      let selectedTrackIndex = this.playlist.findIndex(
        track => track === this.selectedTrack
      );

      if (typeof index === "number") {
        index = index;
      } else if (this.selectedTrack) {
        index = selectedTrackIndex;
      } else {
        index = this.index;
      }
      this.selectedTrack = this.playlist[index];
      this.playing = true;
      this.index = index;
    },
    pause() {
      this.playing = false;
    },
    stop() {
      this.playing = false;
    },
    skip(direction) {
      let index = 0;

      if (direction === "next") {
        index = this.index + 1;
        if (index >= this.playlist.length) {
          index = 0;
        }
      } else {
        index = this.index - 1;
        if (index < 0) {
          index = this.playlist.length - 1;
        }
      }

      this.skipTo(index);
    },
    skipTo(index) {
      this.play(index);
    },
    toggleLoop(value) {
      this.loop = value;
    },
    toggleShuffle(value) {
      this.shuffle = value;
    }
  },
  computed: {
    currentTrack() {
      return this.playlist[this.index];
    },
    getTrackInfo() {
      if (this.selectedTrack) {
        let artist = this.selectedTrack.artist,
          title = this.selectedTrack.title;
        return {
          artist,
          title
        };
      } else {
        return {
          artist: "select",
          title: "song"
        };
      }
    }
  },
  watch: {
    playing(playing) {
      this.seek = this.currentTrack.howl.seek();
      let updateSeek;
      if (playing) {
        updateSeek = setInterval(() => {
          this.seek = this.currentTrack.howl.seek();
        }, 250);
      } else {
        clearInterval(updateSeek);
      }
    }
  }
};
</script>
