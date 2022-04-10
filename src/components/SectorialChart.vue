<template>
  <v-card dark class="white--text pb-5">
    <v-card-title class="align-baseline">
      Sectorial Chart
    </v-card-title>
    <apexchart id="sectorial-data"  type="pie" :options="options" :series="stocksCount"></apexchart>
  </v-card>
</template>

<script>
import _ from 'lodash';
export default {
  name: "SectorialChart",
  data() {
    return {
      stocksCount: [],
      options: {
        chart: {
          id: 'sectorial-data'
        },
        labels: []
      },
    }
  },
  mounted() {
    this.calculateDataForChart(this.priceActions)
  },
  computed: {
    priceActions() {
      return this.$store.getters['getPriceActions'];
    }
  },
  watch: {
    priceActions() {
      this.calculateDataForChart(this.priceActions)
    }
  },
  methods: {
    calculateDataForChart(priceActions) {
      this.options.labels = []
      this.stocksCount = []
      let sectorLevelPriceActions = Object.create(null)
      priceActions.forEach(priceAction => {
        let sectorName = priceAction.sectorName
        let sectorDetailsUrl = priceAction.sectorDetailsUrl
        if (Object.hasOwn(sectorLevelPriceActions, sectorDetailsUrl)) {
          sectorLevelPriceActions[sectorDetailsUrl].stocksCount += 1;
        } else {
          sectorLevelPriceActions[sectorDetailsUrl] = {
            "sectorName": sectorName,
            "stocksCount": 1
          }
        }
      });
      let sectorLevelPriceActionsArray = Object.values(sectorLevelPriceActions)
      let sectorLevelPriceActionsArraySorted = _.orderBy(sectorLevelPriceActionsArray, ['stocksCount'], ['desc'])
      sectorLevelPriceActionsArraySorted.slice(0, 10).forEach((sector) => {
        this.options.labels.push(sector["sectorName"])
        this.stocksCount.push(_.round(sector["stocksCount"], 2))
      })
    }
  }
}
</script>

<style>
.apexcharts-legend-text {
  color: white!important;
  font-size: 1.2rem;
}
</style>
