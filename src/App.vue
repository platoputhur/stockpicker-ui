<template>
  <v-app>
    <v-app-bar app>
      <v-icon
          x-large
          color="green darken-2"
      >
        mdi-chart-waterfall
      </v-icon>
      <span class="text-h6">
        STOCK PICKER
      </span>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
    <v-footer app>
      2022 &copy; StockPicker
    </v-footer>
  </v-app>

</template>

<script>

export default {
  name: 'App',
  metaInfo: {
    title: 'Stock Picker',
    // all titles will be injected into this template
    titleTemplate: '%s | Stock Picker by TechTuft'
  },
  components: {
  },

  data: () => ({
    //
  }),
};
</script>
