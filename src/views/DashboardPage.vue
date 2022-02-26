<template>
  <v-container>
    <v-row>
      <v-spacer/>
      <v-col cols="12">
        <ShortListedStocks />
      </v-col>
      <v-spacer/>
    </v-row>
  </v-container>
</template>

<script>
import ShortListedStocks from "@/components/ShortListedStocks";

export default {
  name: "DashboardPage",
  components: {
    ShortListedStocks
  },
}
</script>

<style scoped>

</style>
