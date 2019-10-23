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
        v-if="trackInfo.cover"
      ></div>
      <div
        class="song-info-tags-labels"
        v-if="selectedTrack"
        :class="[{centered: !playlistActive}]"
        @click="gototrack"
      >
        <h6>Now Playing</h6>
        <h3 v-if="trackInfo.tags">
          <v-icon>mdi-artist</v-icon>
          {{ trackInfo.artist }}
        </h3>
        <h1 v-if="trackInfo.title">
          <v-icon>mdi-subtitles-outline</v-icon>
          {{ trackInfo.title }}
        </h1>
        <h1 v-else-if="selectedTrack">
          <v-icon>mdi-subtitles-outline</v-icon>
          {{ selectedTrack.title }}
        </h1>
        <h5 v-if="trackInfo.tags">
          <v-icon small>mdi-album</v-icon>
          {{trackInfo.tags.album}}
        </h5>
      </div>
      <div class="song-info-tags-labels" v-else>
        <h5>Welcome! Select or Play a Track</h5>
      </div>
      <div
        class="img-display"
        v-if="selectedTrack"
        :class="[{centered: !playlistActive}]"
        @click="gototrack"
      >
        <picture-input
          v-if="uploadEnabled"
          ref="pictureInput"
          margin="16"
          accept="image/jpeg, image/png"
          button-class="btn"
          :custom-strings="{
        upload: '<h1>Bummer!</h1>',
        drag: 'Drag an image or click here to browse'
      }"
          @change="onChange"
        ></picture-input>
        <img :src="getImage" />
        <v-btn
          v-if="cachedTrack.mime.type === 'audio/mpeg'"
          text
          icon
          @click="()=>{ uploadEnabled = !uploadEnabled }"
          class="image-edit-btn"
          v-tooltip.top="uploadEnabled ? 'Cancel' : 'Change Cover'"
        >
          <v-icon v-if="uploadEnabled">mdi-close</v-icon>
          <v-icon v-else>mdi-square-edit-outline</v-icon>
        </v-btn>
        <div class="working-img-overlay" v-if="loadingImg">
          <v-progress-circular indeterminate color="orange"></v-progress-circular>
        </div>
      </div>
    </div>
    <div class="song-info-switch">
      <v-btn
        color="teal lighten-2"
        @click="toggleDetails"
        v-if="detailsActive"
        text
        icon
        v-tooltip.right="'Toggle Tag Editor'"
      >
        <v-icon>mdi-details</v-icon>
      </v-btn>
      <v-btn
        color="blue-grey lighten-4"
        text
        icon
        @click="toggleDetails"
        v-else
        v-tooltip.right="'Toggle Tag Editor'"
      >
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
              <div>
                <h5>Meta Tags Editor</h5>
                <v-form>
                  <v-container>
                    <v-row>
                      <v-col
                        cols="12"
                        v-for="(value, propertyName, index) in cachedTrack.tags"
                        :key="index"
                      >
                        <div
                          v-if="typeof cachedTrack.tags[propertyName] === 'object' && propertyName !== 'picture'"
                        >
                          <p>
                            <strong>{{ propertyName }}</strong>
                          </p>
                          <v-row>
                            <v-col
                              cols="2"
                              v-for="(subValue, subpropertyName, indexx)
                              in cachedTrack.tags[propertyName]"
                              :key="indexx"
                            >
                              <v-text-field
                                v-model="cachedTrack.tags[propertyName][subpropertyName]"
                                :label="typeof subpropertyName === 'number' ? `${propertyName} - ${indexx + 1 ? indexx : 1}` : subpropertyName"
                                @blur="formInput"
                                :disabled="cachedTrack.mime.type !== 'audio/mpeg'"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </div>
                        <v-text-field
                          v-else-if="propertyName !== 'picture'"
                          v-model="cachedTrack.tags[propertyName]"
                          :label="propertyName"
                          @blur="formInput"
                          :disabled="cachedTrack.mime.type !== 'audio/mpeg'"
                        ></v-text-field>

                      </v-col>
                    </v-row>
                  </v-container>
                    <v-select :items="tagOptions" label="Add New Tag" @change="addNewTag" prepend-icon="mdi-file-document-box-plus-outline"></v-select>
                </v-form>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import { remote, ipcRenderer } from 'electron';
import PictureInput from 'vue-picture-input';
import imageCompression from 'browser-image-compression';
import tagsDictionary from './InfoPanel/tagsDictionary';

export default {
  components: {
    PictureInput,
  },
  props: {
    trackInfo: Object,
    playlistActive: Boolean,
    selectedTrack: Object,
  },
  data() {
    return {
      detailsActive: false,
      cachedTrack: {},
      cachedImage: null,
      uploadEnabled: false,
      loadingImg: false,
      tagOptions: Object.keys(tagsDictionary),
    };
  },
  methods: {
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
    async handleImageUpload(Blob) {
      const imageFile = Blob;
      console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`);

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 700,
        useWebWorker: true,
      };
      try {
        const compressedFile = await imageCompression(imageFile, options);
        console.log(
          `compressedFile size ${compressedFile.size / 1024 / 1024} MB`,
        );

        return compressedFile;
      } catch (error) {
        return console.log(error);
      }
    },
    writeNewTags(tags, cid) {
      return new Promise((resolve) => {
        ipcRenderer.send('writeFileRequest', tags, cid);
        ipcRenderer.once(`writeFileResponse-${cid}`, (event, result) => {
          resolve(result);
        });
      });
    },
    formInput(input, format) {
      const newTrack = { ...this.cachedTrack };
      if (this.cachedImage && newTrack.tags.picture) {
        newTrack.tags.picture[0].data = this.cachedImage;
        newTrack.tags.picture[0].format = format;
      } else if (this.cachedImage) {
        newTrack.tags.picture = [
          {
            data: this.cachedImage,
            format,
            description: '',
          },
        ];
      } else if (!this.cachedImage && !newTrack.tags.picture) {
        newTrack.tags.picture = [
          {
            data: this.cachedImage,
            format,
            description: '',
          },
        ];
      }
      this.writeNewTags(newTrack, this.cachedTrack.indexId).then(() => {
        this.cachedImage = null;
      });
    },
    onChange(image) {
      this.loadingImg = true;
      if (image) {
        const [formatString, data64] = image.split(',');
        const format = formatString.split(':')[1].split(';')[0];
        this.handleImageUpload(this.b64toBlob(data64, format)).then(
          (newImage) => {
            const reader = new FileReader();
            reader.readAsDataURL(newImage);
            const b64 = reader.result.replace(/^data:.+;base64,/, '');
            reader.onloadend = () => {
              const base64data = reader.result.replace(/^data:.+;base64,/, '');
              this.cachedImage = Buffer.from(base64data, 'base64');
              this.cachedTrack.cover = base64data;
              this.formInput(true, format);
              this.uploadEnabled = false;
              this.loadingImg = false;
            };
          },
        );
      } else {
        this.uploadEnabled = false;
        this.loadingImg = false;
        console.log('FileReader API not supported: use the <form>, Luke!');
      }
    },
    b64toBlob(b64Data, contentType = '', sliceSize = 512) {
      const byteCharacters = atob(b64Data);
      const byteArrays = [];

      for (
        let offset = 0;
        offset < byteCharacters.length;
        offset += sliceSize
      ) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: contentType });
      return blob;
    },
    addNewTag(tag) {
      const newTags = { ...this.cachedTrack };
      newTags.tags[tag] = '';
      this.$emit('addTag', newTags);
    },
  },
  computed: {
    getImage() {
      if (this.trackInfo && this.trackInfo.cover) {
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
  watch: {
    selectedTrack(newTrack) {
      this.cachedTrack = newTrack;
    },
  },
};
</script>
<style lang="scss">
.image-edit-btn {
  position: absolute;
  bottom: 0;
  left: 50%;
  margin-left: -18px;
  z-index: 10;
  background: #66666624;
  transition: all 0.4s ease;
  &:hover {
    background: #6666668a;
  }
}
#picture-input {
  position: absolute;
  height: 100%;
  z-index: 8;
  > div {
    height: 100%;
  }
  .preview-container {
    max-height: 100% !important;
    height: 100% !important;
  }

  .picture-inner-text {
    color: #333;
  }
}
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
      transform: translateX(0%);
      transition: transform 0.3s ease;
      .working-img-overlay {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
      }
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
  width: 320px;
}
</style>
