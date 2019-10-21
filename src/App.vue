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
          <v-col cols="12" style="padding-bottom: 48px;">
            <PlayerSearchBar :playlist="playlist" @updateFolder="reloadPlaylist" />
            <div class="scroller" id="playlist-panel" v-if="playlist.length">
              <PlayerPlaylistPanel
                :playlist="playlist"
                :selectedTrack="selectedTrack"
                :currentTrack="currentTrack"
                :playing="playing"
                @selecttrack="selectTrack"
                @playtrack="play"
                ref="playListComponent"
              />
            </div>
            <div>
              <v-card>
                <v-list>
                  <v-list-item>
                    No valid files found on selected directory.
                    Please select a directory to import audio files from
                  </v-list-item>
                </v-list>
              </v-card>
            </div>
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
              >
                <strong>{{ getLoadPercent | percent }}</strong>
              </v-progress-circular>
              <h5 class="text-center grey--text mt-2">Analyzing Files</h5>
            </v-col>
          </v-row>
        </v-layout>
      </v-container>
      <PlayerInfoPanel
        :trackInfo="getTrackInfo"
        :playlistActive="playlistActive"
        @openPlaylist="openPlaylist"
        @gototrack="gototrack"
      />
      <div class="playlist-switch">
        <v-btn
          color="teal lighten-2"
          @click="() => {this.playlistActive = false}"
          v-if="playlistActive"
          text
          icon
          v-tooltip.right="'Toggle Playlist (P)'"
        >
          <v-icon>mdi-format-list-numbered</v-icon>
        </v-btn>
        <v-btn
          color="blue-grey lighten-4"
          text
          icon
          @click="openPlaylist"
          v-else
          v-tooltip.right="'Toggle Playlist (P)'"
        >
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
          @gototrack="gototrack"
        />
      </div>
    </v-content>
    <v-snackbar v-model="downloadReady" color="red">
      An update is ready to be installed.
      <v-btn color="black" text @click="() => {
              remote.app.quit();
        }">Restart</v-btn>
    </v-snackbar>
    <WelcomeModal />
  </v-app>
</template>

<script>
import { remote, ipcRenderer } from 'electron';
import { mapState, mapActions } from 'vuex';
import PlayerTitleBar from './components/ToolBar.vue';
import PlayerPlaylistPanel from './components/PlayerPlaylistPanel.vue';
import PlayerControls from './components/PlayerControls.vue';
import PlayerInfoPanel from './components/PlayerInfoPanel.vue';
import PlayerSearchBar from './components/PlayerSearchBar.vue';
import WelcomeModal from './components/WelcomeModal.vue';
import jsmediatags from './plugins/jsmediatags';

const initialState = () => ({
  dataLoaded: false,
  listLoaded: false,
  playListReady: false,
  infoToLoad: null,
  infoLoaded: 0,
  selectedTrack: null,
  index: -0,
  playlist: [],
  playing: false,
});

export default {
  name: 'App',
  components: {
    PlayerTitleBar,
    PlayerPlaylistPanel,
    PlayerControls,
    PlayerInfoPanel,
    PlayerSearchBar,
    WelcomeModal,
  },
  data: () => ({
    ...initialState(),
    initializing: true,
    playlistActive: true,
    supportedFormats: {
      au: { type: 'audio/basic' },
      snd: { type: 'audio/basic' },
      pmc: { type: 'auido/L24' },
      mp3: { type: 'audio/mpeg' },
      mp4: { type: 'audio/mp4' },
      aif: { type: 'audio/x-aiff' },
      aifc: { type: 'audio/x-aiff' },
      aiff: { type: 'audio/x-aiff' },
      m3u: { type: 'audio/x-mpegurl' },
      ra: { type: 'audio/vnd.rn-realaudio' },
      ram: { type: 'audio/vnd.rn-realaudio' },
      Ogg: { type: 'audio/ogg' },
      vorbis: { type: 'audio/vorbis' },
      wav: { type: 'audio/vnd.wav' },
      opus: { type: 'audio/ogg' },
      flac: { type: 'audio/flac' },
    },
    selectedTrack: null,
    loop: false,
    shuffle: false,
    seek: 0,
    downloadReady: false,
  }),
  created() {
    if (!this.loadDir) {
      const path = remote.require('path');
      const pathToAsset = path.join(__static, '/');
      console.log('before', pathToAsset);
      this.setLoadDir(pathToAsset);
    }
    this.scanDirectory();
  },
  mounted() {
    ipcRenderer.on('message', (event, arg) => {
      if (arg === 'Update downloaded') this.downloadReady = true;
    });
    this.$mousetrap.bind(
      'p',
      () => {
        this.playlistActive = !this.playlistActive;
      },
      'keyup',
    );
  },
  methods: {
    ...mapActions({
      setLoadDir: 'setLoadDir',
    }),
    callForTags(args, cid) {
      return new Promise((resolve) => {
        ipcRenderer.send('readFileRequest', args, cid);
        ipcRenderer.once(`readFileResponse-${cid}`, (event, result) => {
          resolve(result);
        });
      });
    },
    scanDirectory() {
      const electronFs = remote.require('fs');
      electronFs.readdir(this.loadDir, (err, files) => {
        if (!files) {
          this.loadPlaylist();
          this.dataLoaded = true;
        }
        console.log('loading dir', this.loadDir, files);
        if (err) {
          console.log('err', err);
        }
        this.initializing = false;
        this.infoToLoad = files.length - 1;
        files.forEach((file, index) => {
          const fileArray = file.split('.');
          const fileFormat = fileArray.slice(-1)[0];
          if (
            this.supportedFormats[fileFormat]
            && file.charAt(0) !== '.'
            && this.playlist.length < 501
          ) {
            let idNum = 0;
            for (let i = 0, len = file.length; i < len; i += 1) {
              idNum += file[i].charCodeAt(0);
            }
            this.callForTags(this.loadDir + file, idNum += index).then((result) => {
              const fileObj = {
                title: file,
                path: this.loadDir + file,
                display: true,
                indexId: idNum += index,
                index,
                mime: this.supportedFormats[fileFormat],
                tags: result.common,
                cover: result.common.picture
                  ? this.arrayBufferToBase64(result.common.picture[0].data) : null,
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
    loaderStep() {
      this.infoLoaded += 1;
      if (this.infoToLoad === this.infoLoaded) {
        this.playlist.sort(this.compare);
        setTimeout(() => {
          if (!this.dataLoaded) {
            this.dataLoaded = true;
            this.listLoaded = true;
            this.playListReady = true;
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
      this.selectedTrack = this.playlist[localIndex];
      this.playing = true;
      this.index = localIndex;
      if (window.innerWidth < 991) {
        this.playlistActive = false;
      }
    },
    resetPlaylist() {
      Object.assign(this.$data, initialState());
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
      if (a.index < b.index) {
        return -1;
      }
      if (a.index > b.index) {
        return 1;
      }
      return 0;
    },
    reloadPlaylist(newPath) {
      this.playing = false;
      console.log('new path', newPath);
      this.setLoadDir(`${newPath[0]}/`);
      this.resetPlaylist();
      this.scanDirectory();
    },
    arrayBufferToBase64(buffer) {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i += 1) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    },
    gototrack(track) {
      this.$refs.playListComponent.initiateScroll(track);
    },
  },
  computed: {
    ...mapState(['loadDir']),
    currentTrack() {
      const newCur = this.playlist[this.index];
      if (newCur) {
        newCur.indexFlag = this.index;
      }
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
          cover: this.selectedTrack.cover,
          extendedTags: this.selectedTrack.tags,
          indexId: this.selectedTrack.indexId,
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
      if (!this.initializing && this.infoLoaded > 0) {
        // console.log('loading', this.infoLoaded, this.infoToLoad);
        return ((this.infoLoaded - 1) / this.infoToLoad) * 100;
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
  .scroller {
    padding-bottom: 398px;
    overflow: auto;
    height: 100vh;
    border-radius: 6px;
  }
  position: absolute;
  left: 0;
  top: 56px;
  padding-top: 0;
  transition: transform 0.4s ease, top 0.4s ease;
  transform: translateX(-100%);
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
  box-shadow: 0px -1px 29px 24px #0000005e;
  border-top: 1px solid rgba(67, 67, 67, 0.72);
  backdrop-filter: blur(4px);
}
.playlist-switch {
  position: fixed;
  right: 0;
  top: calc(100vh - 255px);
  transition: all 0.4s ease;
  z-index: 10;
  text-align: right;
  &:hover {
    min-width: 25%;
  }
}
</style>
