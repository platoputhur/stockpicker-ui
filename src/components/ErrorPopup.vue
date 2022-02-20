<template>
  <v-snackbar
      v-model="snackbar"
      :timeout="timeout"
  >
    {{ errorMessage }}

    <template v-slot:action="{ attrs }">
      <v-btn
          color="pink"
          text
          v-bind="attrs"
          @click="snackbar = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  name: "ErrorPopup",
  props: {
    errorMessage: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      snackbar: false,
      timeout: 2000,
    }
  },
  mounted() {
    this.snackbar = true
  }
}
</script>

<style scoped>

</style>
