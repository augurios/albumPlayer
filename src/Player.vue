<template>
  <v-app dark>
    <PlayerTitleBar />
    <v-content class="main-content">
      <v-container
        :fluid="true"
        v-if="this.listLoaded"
        class="playlist-panel"
        v-bind:class="{ active: playlistActive }"
        v-touch:swipe.left="() => {this.playlistActive = false}"
      >
        <v-row>
          <v-col cols="12" sm="12" md="6" lg="6" style="padding-bottom: 48px;">
            <PlayerSearchBar :playlist="playlist" />
            <PlayerPlaylistPanel
              :playlist="playlist"
              :selectedTrack="selectedTrack"
              :currentTrack="currentTrack"
              @selecttrack="selectTrack"
              @playtrack="play"
            />
          </v-col>
        </v-row>
      </v-container>
      <v-container :fluid="true" fill-height v-else class="loader">
        <v-layout row wrap>
          <v-row justify="center">
            <v-col cols="4" align-self="center">
              <v-progress-circular
                :rotate="360"
                :size="100"
                :width="15"
                :value="getLoadPercent"
                color="teal lighten-2"
              ></v-progress-circular>
              <h5 class="text-center grey--text mt-2">Loading Playlist</h5>
            </v-col>
          </v-row>
        </v-layout>
      </v-container>
      <PlayerInfoPanel :trackInfo="getTrackInfo" @openPlaylist="openPlaylist" />
      <div class="playlist-switch">
        <v-btn
          color="teal lighten-2"
          @click="() => {this.playlistActive = false}"
          v-if="playlistActive"
          text
          icon
        >
          <v-icon>mdi-format-list-numbered</v-icon>
        </v-btn>
        <v-btn color="blue-grey lighten-4" text icon @click="openPlaylist" v-else>
          <v-icon>mdi-format-list-numbered</v-icon>
        </v-btn>
      </div>
      <div class="player-holder">
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
      </div>
    </v-content>
  </v-app>
</template>

<script>
import PlayerTitleBar from "./components/ToolBar";
import PlayerPlaylistPanel from "./components/PlayerPlaylistPanel";
import PlayerControls from "./components/PlayerControls";
import PlayerInfoPanel from "./components/PlayerInfoPanel";
import PlayerSearchBar from "./components/PlayerSearchBar";
import jsmediatags from "./assets/jsmediatags.js";

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
    listLoaded: false,
    infoLoaded: 0,
    playlistActive: true,
    playlist: [
      {
        title: "01. Alex & Chris - Deep Dream ",
        howl: null,
        url: null,
        display: true
      },
      {
        title: "02. Alex & Chris - Rosemary ",
        howl: null,
        url: null,
        display: true
      },
      {
        title: "03. Alex & Chris - Paradise ",
        howl: null,
        url: null,
        display: true
      },
      {
        title: "04. Stefan Schnabel - Fashion Repo",
        howl: null,
        url: null,
        display: true
      },
      {
        title: "05. Stefan Schnabel - Turn the Light On  ",
        howl: null,
        url: null,
        display: true
      },
      {
        title: "06. Stefan Schnabel - Underground of Fashion ",
        howl: null,
        url: null,
        display: true
      },
      {
        title: "07. Alex & Chris - Digital Eclipse ",
        howl: null,
        url: null,
        display: true
      },
      {
        title: "08. Alex & Chris - Brothers ",
        howl: null,
        url: null,
        display: true
      },
      {
        title: "dios-del-design--malaugurio-ft-cajaeveneno",
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
    seek: 0
  }),
  created: function() {
    this.playlist.forEach(track => {
      let file = track.title.replace(/\s/g, "_");
      track.url = `./playlist/${file}.mp3`;
      jsmediatags.read(`${window.location.origin}/playlist/${file}.mp3`, {
        onSuccess: ({ tags }) => {
          track.tags = tags;
          this.infoLoaded++;
          if (this.playlist.length === this.infoLoaded) {
            setTimeout(() => {
              this.listLoaded = true;
            }, 700);
          }
        },
        onError: function(error) {
          this.infoLoaded++;
          console.log(error);
        }
      });
    });
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
        this.index = index;
      } else if (this.selectedTrack) {
        index = selectedTrackIndex;
      } else {
        index = this.index;
      }
      this.selectedTrack = this.playlist[index];
      this.playing = true;
      this.index = index;
      this.playlistActive = false;
    },
    pause() {
      this.playing = false;
    },
    stop() {
      this.playing = false;
    },
    skip(direction) {
      let index = 0;

      let lastIndex = this.playlist.length - 1;

      if (this.shuffle) {
        index = Math.round(Math.random() * lastIndex);
        while (index === this.index) {
          index = Math.round(Math.random() * lastIndex);
        }
      } else if (direction === "next") {
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
    },
    openPlaylist() {
      this.playlistActive = true;
    }
  },
  computed: {
    currentTrack() {
      return this.playlist[this.index];
    },
    getTrackInfo() {
      if (this.selectedTrack && this.selectedTrack.tags) {
        const {
          album,
          artist,
          comment,
          genre,
          picture,
          title,
          track
        } = this.selectedTrack.tags;
        const tags = { album, comment, genre, picture, track };
        return {
          artist,
          title,
          tags,
          extendedTags: this.selectedTrack.tags
        };
      } else {
        return {
          artist: "select",
          title: "song"
        };
      }
    },
    getLoadPercent() {
      if (this.infoLoaded > 0) {
        return (this.infoLoaded / this.playlist.length) * 100;
      } else {
        return ((this.infoLoaded * 2) / this.playlist.length) * 100;
      }
    }
  }
};
</script>
<style lang="scss">
.loader {
  position: absolute;
  top: 0;
  padding-bottom: 219px;
}
.main-content {
  padding-top: 0 !important;
  height: 100%;
  overflow: hidden;
  background-image: url("/images/logo.png");
  background-size: 100%;
  background-position: center calc(50% - 86px);
}
.playlist-panel {
  position: absolute;
  left: 0;
  top: 56px;
  padding-top: 0;
  transition: all 0.4s ease;
  transform: translateX(-100%);
  padding-bottom: 260px;
  overflow: auto;
  height: 100%;
  z-index: 1;
  &.active {
    transform: translateX(0);
  }
}
.player-holder {
  position: absolute;
  bottom: 0;
  width: 100%;
  z-index: 1;
  box-shadow: 0px -1px 29px 24px #000000a3;
  border-top: 1px solid rgba(67, 67, 67, 0.72);
}
.playlist-switch {
  position: fixed;
  left: 0;
  top: calc(100vh - 255px);
  transition: all 0.4s ease;
  z-index: 10;
}
</style>
