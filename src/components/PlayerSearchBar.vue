<template>
  <v-toolbar flat class="pt-3">
    <v-text-field
      clearable
      prepend-icon="mdi-search-web"
      placeholder="Quick search"
      v-model="searchString"
      @input="searchPlaylist"
    ></v-text-field>
    <v-spacer></v-spacer>
    <v-btn color="teal lighten-2" dark @click="getDirectory">
      <v-icon>mdi-database-import</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script>
import { remote } from 'electron';

export default {
  props: {
    playlist: Array,
  },
  data() {
    return {
      searchString: '',
    };
  },
  methods: {
    searchPlaylist() {
      this.playlist.forEach((track, index) => {
        const newTrack = this.playlist[index];
        if (this.searchString) {
          if (
            !track.title
              .toLowerCase()
              .includes(this.searchString.toLowerCase())
            && !track.tags.artist
              .toLowerCase()
              .includes(this.searchString.toLowerCase())
          ) {
            newTrack.display = false;
          } else {
            newTrack.display = true;
          }
        } else if (this.searchString === '' || this.searchString === null) {
          newTrack.display = true;
        }
      });
    },
    getDirectory(event) {
      const { dialog } = remote;
      const path = dialog
        .showOpenDialog({
          properties: ['openDirectory'],
        })
        .then((result) => {
          if (!result.canceled) {
            this.$emit('updateFolder', result.filePaths);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>
