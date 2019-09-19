<template>
  <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>{{appName}} </span>
        <span class="font-weight-light">{{appSlogan}}</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        text
        href="#"
        target="_blank"
      >
        <span class="mr-2">Stuff</span>
      </v-btn>
    </v-app-bar>
</template>

<script>
  export default {
    data () {
      return {
        appName: "Integral",
        appSlogan: "Album Player",
      }
    },
  }
</script>