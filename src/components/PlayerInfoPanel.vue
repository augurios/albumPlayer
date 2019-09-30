<template>
  <div class="song-info">
    <div
      class="song-info-tags"
      :class="{active : trackInfo}"
      v-touch:swipe.left="toggleDetails"
      v-touch:swipe.right="openPlaylist"
    >
      <div
        class="song-info-tags-bg"
        :style="`background-image:url(${getImage})`"
        v-if="trackInfo.tags"
      ></div>
      <div class="song-info-tags-labels" v-if="trackInfo.title" :class="[{centered: !playlistActive}]" @click="gototrack">
        <h6>Now Playing</h6>
        <h3 v-if="trackInfo.tags">
          <v-icon>mdi-artist</v-icon>
          {{ trackInfo.artist }}
        </h3>
        <h1>
          <v-icon>mdi-subtitles-outline</v-icon>
          {{ trackInfo.title }}
        </h1>
        <h5 v-if="trackInfo.tags">
          <v-icon small>mdi-album</v-icon>
          {{trackInfo.tags.album}}
        </h5>
      </div>
      <div class="song-info-tags-labels" v-else>
        <h5>Welcome! Select or Play a Track</h5>
      </div>
      <div class="img-display" v-if="trackInfo.title" :class="[{centered: !playlistActive}]"  @click="gototrack">
        <img :src="getImage" />
      </div>
    </div>
    <div class="song-info-switch">
      <v-btn color="teal lighten-2" @click="toggleDetails" v-if="detailsActive" text icon>
        <v-icon>mdi-details</v-icon>
      </v-btn>
      <v-btn color="blue-grey lighten-4" text icon @click="toggleDetails" v-else>
        <v-icon>mdi-details</v-icon>
      </v-btn>
    </div>
    <div
      class="song-info-tags-details"
      v-if="trackInfo.tags"
      v-touch:swipe.right="toggleDetails"
      v-bind:class="{active: detailsActive}"
    >
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-text>
              <p v-if="trackInfo.tags.comment">{{trackInfo.tags.comment.short_description}} {{trackInfo.tags.comment.text}}</p>
              <p>
                <strong>Track:</strong>
                {{trackInfo.tags.track}}
              </p>
              <p>
                <strong>Genre:</strong>
                {{trackInfo.tags.genre}}
              </p>
              <div v-if="trackInfo.extendedTags">
                <h6>MetaTags</h6>
                <v-treeview :items="getExtendedTags"></v-treeview>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    trackInfo: Object,
    playlistActive: Boolean,
  },
  data() {
    return {
      detailsActive: false,
    };
  },
  methods: {
    arrayBufferToBase64(buffer) {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i += 1) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    },
    toggleDetails() {
      this.detailsActive = !this.detailsActive;
    },
    openPlaylist() {
      this.detailsActive = false;
      this.$emit('openPlaylist');
    },
    gototrack() {
      this.$emit('gototrack', this.trackInfo);
    },
  },
  computed: {
    getImage() {
      if (
        this.trackInfo
        && this.trackInfo.cover
      ) {
        return `data:${this.trackInfo.tags.picture.format};base64,${this.trackInfo.cover}`;
      }
      return `${window.location.origin}/images/logo.png`;
    },
    getExtendedTags() {
      if (this.trackInfo.extendedTags) {
        const objectArray = Object.values(this.trackInfo.extendedTags);
        const tagsArray = [];
        objectArray.forEach((element) => {
          if (typeof element === 'object' && element.description) {
            const {
              id, size, description, data,
            } = element;
            tagsArray.push({
              id,
              size,
              name: description,
              children: [{ name: data }],
            });
          }
        });
        return tagsArray;
      }
      return [];
    },
  },
};
</script>
<style lang="scss">
.song-info {
  height: 100%;
  &-tags {
    height: 100%;
    position: relative;
    opacity: 0;
    transition: all 1s ease;
    &.active {
      opacity: 1;
    }
    &-bg {
      background-size: cover;
      background-position: center center;
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100%;
      filter: blur(1px);
      opacity: 0.6;
    }
    &-details {
      padding: 15px;
      position: absolute;
      top: 192px;
      z-index: 0;
      width: 100%;
      right: -100vw;
      transition: all 0.3s ease;
      transform: translateX(0);
      height: calc(100vh - 269px);
      overflow: auto;
      &.active {
        transform: translateX(-100vw);
      }
      .v-card {
        margin-bottom: 158px;
      }
    }
    &-placeholder {
      padding-top: 72px;
      width: 100%;
      text-align: center;
      font-size: 28px;
    }
    &-labels {
      position: absolute;
      top: 78px;
      left: 15px;
      text-shadow: 0px 0px 6px #000;
      white-space: nowrap;
      width: calc(100% - 30px);
      padding-right: 30px;
      background: #0000008c;
      padding: 8px;
      backdrop-filter: blur(14px);
      border-radius: 6px;
      box-shadow: 1px 1px 2px #0000002e;
      transform: translateX(0%);
      transition: transform 0.3s ease, width 0.3s ease;
      * {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      @media (min-width: 991px) {
        width: 48%;
        &.centered {
              transform: translateX(50%);
                  width: 50%;
        }
      }
    }
    .img-display {
      position: absolute;
      width: calc(100% - 42px);
      bottom: 254px;
      left: 50%;
      margin-left: calc(-50% + 21px);
      text-align: center;
      height: calc(100% - 473px);
      line-height: 0;
      transform: translateX(0%);
      transition: transform 0.3s ease;
      @media (min-width: 991px) {
        width: 50vw;
        left: 15px;
        margin-left: 0;
        &.centered {
              transform: translateX(calc(50% - 7px));
        }
      }
      img {
        max-width: 100%;
        min-width: 64px;
        max-height: 100%;
        min-height: 64px;
        box-shadow: 1px 1px 2px #0000002e;
        background-color: #424242;
      }
    }
  }
}
.song-info-switch {
  position: absolute;
  bottom: 218px;
  z-index: 10;
  left: 0;
}
</style>
