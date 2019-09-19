<template>
  <v-card>
    <v-card-title>
      <h2>{{ trackInfo.artist }} - {{ trackInfo.title }}</h2>
      <v-spacer></v-spacer>
    </v-card-title>    
  </v-card>
</template>
 
<script>
  export default {
    props: {
      trackInfo: Object
    },
  }
</script>