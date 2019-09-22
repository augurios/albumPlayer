<template>
  <div class="song-info">
    <div
      class="song-info-tags"
      v-if="trackInfo.tags"
      v-touch:swipe.left="toggleDetails"
      v-touch:swipe.right="openPlaylist"
    >
      <div
        class="song-info-tags-bg"
        v-for="(bg) in [1,2,3]"
        :key="bg"
        :class="'bg-' + bg"
        :style="`background-image:url(${getImage})`"
      ></div>
      <div class="song-info-tags-labels">
        <h6>Now Playing</h6>
        <h3>
          <v-icon>mdi-artist</v-icon>
          {{ trackInfo.artist }}
        </h3>
        <h1>
          <v-icon>mdi-subtitles-outline</v-icon>
          {{ trackInfo.title }}
        </h1>
        <h5>
          <v-icon small>mdi-album</v-icon>
          {{trackInfo.tags.album}}
        </h5>
      </div>
    </div>
    <div class="song-info-switch">
      <v-btn color="light-blue" @click="toggleDetails" v-if="detailsActive" text icon>
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
              <p>{{trackInfo.tags.comment.short_description}} {{trackInfo.tags.comment.text}}</p>
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
    trackInfo: Object
  },
  data() {
    return {
      detailsActive: false
    };
  },
  methods: {
    arrayBufferToBase64(buffer) {
      let binary = "";
      let bytes = new Uint8Array(buffer);
      let len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    },
    toggleDetails() {
      this.detailsActive = !this.detailsActive;
    },
    openPlaylist() {
      this.detailsActive = false;
      this.$emit("openPlaylist");
    }
  },
  computed: {
    getImage() {
      let base64String = this.arrayBufferToBase64(
        this.trackInfo.tags.picture.data
      );
      return `data:${this.trackInfo.tags.picture.format};base64,${base64String}`;
    },
    getExtendedTags() {
      if (this.trackInfo.extendedTags) {
        let objectArray = Object.values(this.trackInfo.extendedTags);
        let tagsArray = [];
        objectArray.forEach(element => {
          if (typeof element === "object" && element.description) {
            const { id, size, description, data } = element;
            tagsArray.push({
              id,
              size,
              name: description,
              children: [{ name: data }]
            });
          }
        });
        return tagsArray;
      }
      return [];
    }
  }
};
</script>
<style lang="scss">
.song-info {
  height: 100%;
  &-tags {
    height: 100%;
    position: relative;
    &-bg {
      background-size: cover;
      background-position: center center;
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100%;
      background-attachment: fixed;
      filter: blur(4px);
      &.bg-1 {
        height: 56px;
        z-index: 2;
      }
      &.bg-2 {
        filter: initial;
      }
      &.bg-3 {
        top: initial;
        height: 128px;
        bottom: 89px;
      }
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
        padding-bottom: 210px;
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
      top: 72px;
      left: 15px;
      text-shadow: 0px 0px 6px #000;
    }
  }
}
.song-info-switch {
  position: absolute;
  bottom: 218px;
  z-index: 10;
  right: 0;
}
</style>