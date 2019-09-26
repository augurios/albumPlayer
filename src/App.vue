<template>
  <v-app dark>

    <PlayerTitleBar />
    <v-content class="main-content">
      <v-container
        :fluid="true"
        v-if="this.listLoaded"
        class="playlist-panel"
        id="playlist-panel"
        v-bind:class="{ active: playlistActive }"
        v-touch:swipe.left="() => {this.playlistActive = false}"
      >
        <v-row>
          <v-col cols="12" style="padding-bottom: 48px;">
            <PlayerSearchBar :playlist="playlist" />
            <PlayerPlaylistPanel
              :playlist="playlist"
              :selectedTrack="selectedTrack"
              :currentTrack="currentTrack"
              :playing="playing"
              @selecttrack="selectTrack"
              @playtrack="play"
            />
          </v-col>
        </v-row>
      </v-container>
      <v-container :fluid="true" fill-height v-else class="loader">
        <v-layout row wrap>
          <v-row justify="center">
            <v-col cols="4" sm="2" align-self="center">
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
      <PlayerInfoPanel :trackInfo="getTrackInfo" :playlistActive="playlistActive" @openPlaylist="openPlaylist" />
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
          @selecttrack="selectTrack"
        />
      </div>
    </v-content>
  </v-app>
</template>

<script>
import { remote } from 'electron';
import PlayerTitleBar from './components/ToolBar.vue';
import PlayerPlaylistPanel from './components/PlayerPlaylistPanel.vue';
import PlayerControls from './components/PlayerControls.vue';
import PlayerInfoPanel from './components/PlayerInfoPanel.vue';
import PlayerSearchBar from './components/PlayerSearchBar.vue';
import jsmediatags from './plugins/jsmediatags';

export default {
  name: 'App',
  components: {
    PlayerTitleBar,
    PlayerPlaylistPanel,
    PlayerControls,
    PlayerInfoPanel,
    PlayerSearchBar,
  },
  data: () => ({
    initializing: true,
    infoToLoad: null,
    dataLoaded: false,
    playListReady: false,
    listLoaded: false,
    infoLoaded: 0,
    playlistActive: true,
    playlist: [],
    supportedFormats: {
      au: { type: 'audio/basic' },
      snd: { type: 'audio/basic' },
      pmc: { type: 'auido/L24' },
      mid: { type: 'audio/mid' },
      rmi: { type: 'audio/mid' },
      mp3: { type: 'audio/mpeg' },
      mp4: { type: 'audio/mp4' },
      aif: { type: 'audio/x-aiff' },
      aifc: { type: 'audio/x-aiff' },
      aiff: { type: 'audio/x-aiff' },
      m3u: { type: 'audio/x-mpegurl' },
      ra: { type: 'audio/vnd.rn-realaudio' },
      ram: { type: 'audio/vnd.rn-realaudio' },
      Ogg: { type: 'audio/ogg' },
      Vorbis: { type: 'audio/vorbis' },
      wav: { type: 'audio/vnd.wav' },
      opus: { type: 'audio/ogg' },
      flac: { type: 'audio/flac' },
    },
    selectedTrack: null,
    index: -0,
    playing: false,
    loop: false,
    shuffle: false,
    seek: 0,
  }),
  created() {
    const electronFs = remote.require('fs');
    // const loadDir = '/Users/augustovalerio/Sites/myplayer/albumPlayer/public/playlist/';
    const loadDir = '/Volumes/ExternalMem/deephouse/BT_Deep_House_Top_100_December_2015/';

    electronFs.readdir(loadDir, (err, files) => {
      if (err) {
        console.log('err', err);
      }
      this.initializing = false;
      this.infoToLoad = files.length - 1;
      files.forEach((file, index) => {
        const fileArray = file.split('.');
        const fileFormat = fileArray.slice(-1)[0];
        if (this.supportedFormats[fileFormat] && file.charAt(0) !== '.') {
          electronFs.readFile(loadDir + file, (error, data) => {
            if (error) throw error;
            const fileObj = {
              title: file,
              path: loadDir + file,
              file: data,
              display: true,
              indexId: index,
              mime: this.supportedFormats[fileFormat],
            };
            this.playlist.push(fileObj);
            this.loaderStep();
          });
        } else {
          this.loaderStep();
        }
      });
    });
    console.log(remote.app.getVersion(), remote, window, electronFs);
  },
  methods: {
    loadPlaylist() {
      console.log('loadp', this.playlist);
      let playlistCount = 1;
      this.newPlaylist = [];
      this.playlist.forEach((track, index) => {
        jsmediatags.read(track.file, {
          onSuccess: ({ tags }) => {
            this.playlist[index].tags = tags;
            playlistCount += 1;

            if (playlistCount === this.playlist.length) {
              this.listLoaded = true;
              this.playListReady = true;
            }
          },
          onError: ({ info, type }) => {
            playlistCount += 1;
            console.error(`Error Reading Tags: ${info}, Type:${type}`);
          },
        });
      });
      console.log('playlist', this.playlist);
    },
    loaderStep() {
      this.infoLoaded += 1;
      if (this.infoToLoad === this.infoLoaded) {
        this.playlist.sort(this.compare);
        setTimeout(() => {
          if (!this.dataLoaded) {
            this.loadPlaylist();
            this.dataLoaded = true;
          }
        }, 700);
      }
    },
    selectTrack(track) {
      this.selectedTrack = track;
    },
    play(index) {
      let localIndex = index;
      const selectedTrackIndex = this.playlist.findIndex(
        track => track === this.selectedTrack,
      );

      if (typeof index === 'number') {
        this.index = localIndex;
      } else if (this.selectedTrack) {
        localIndex = selectedTrackIndex;
      } else {
        localIndex = this.index;
      }
      this.selectedTrack = {};
      this.selectedTrack = this.playlist[index];
      this.playing = true;
      this.index = localIndex;
      if (window.innerWidth < 991) {
        this.playlistActive = false;
      }
    },
    pause() {
      this.playing = false;
    },
    stop() {
      this.playing = false;
    },
    skip(direction) {
      let index = 0;

      const lastIndex = this.playlist.length - 1;

      if (this.shuffle) {
        index = Math.round(Math.random() * lastIndex);
        while (index === this.index) {
          index = Math.round(Math.random() * lastIndex);
        }
      } else if (direction === 'next') {
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
    },
    compare(a, b) {
      if (a.indexId < b.indexId) {
        return -1;
      }
      if (a.indexId > b.indexId) {
        return 1;
      }
      return 0;
    },
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
          track,
        } = this.selectedTrack.tags;
        const tags = {
          album,
          comment,
          genre,
          picture,
          track,
        };
        return {
          artist,
          title,
          tags,
          extendedTags: this.selectedTrack.tags,
        };
      }
      if (this.selectedTrack && this.selectedTrack.title) {
        return {
          title: this.selectedTrack.title,
          tags: null,
        };
      }
      return {
        tags: null,
        title: null,
      };
    },
    getLoadPercent() {
      if (!this.initializing) {
        if (this.infoLoaded > 0) {
          return (this.infoLoaded / this.infoToLoad) * 100;
        }
        return ((this.infoLoaded * 2) / this.infoToLoad) * 100;
      }
      return 0;
    },
  },
};
</script>
<style lang="scss">
*::-webkit-scrollbar {
  display: none;
}
.theme--dark.v-application {
  background: #30303063 !important;
}
.loader {
  position: absolute;
  top: 0;
  padding-bottom: 219px;
  .align-self-center {
    text-align: center;
  }
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
  transition: transform 0.4s ease, top 0.4s ease;
  transform: translateX(-100%);
  padding-bottom: 260px;
  overflow: auto;
  height: 100%;
  z-index: 1;
  @media (min-width: 991px) {
    left: initial;
    right: 0;
    width: 50vw;
    max-width: 768px;
    transform: translateX(100%);
  }
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
  backdrop-filter: blur(4px);
}
.playlist-switch {
  position: fixed;
  left: 0;
  top: calc(100vh - 255px);
  transition: all 0.4s ease;
  z-index: 10;
}
</style>
