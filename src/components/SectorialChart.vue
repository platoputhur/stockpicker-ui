<template>
  <v-card dark class="white--text pb-5">
    <v-card-title class="align-baseline">
      Sectorial Chart
    </v-card-title>
    <apexchart id="sectorial-data"  type="donut" :options="options" :series="totalProfits"></apexchart>
  </v-card>
</template>

<script>
import _ from 'lodash';
export default {
  name: "SectorialChart",
  data() {
    return {
      totalProfits: [],
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
      let sectorLevelPriceActions = Object.create(null)
      priceActions.forEach(priceAction => {
        let sectorName = priceAction.sectorName
        let sectorDetailsUrl = priceAction.sectorDetailsUrl
        let profitPercentage = priceAction.profit
        if (Object.hasOwn(sectorLevelPriceActions, sectorDetailsUrl)) {
          sectorLevelPriceActions[sectorDetailsUrl].totalProfits += profitPercentage;
        } else {
          sectorLevelPriceActions[sectorDetailsUrl] = {
            "sectorName": sectorName,
            "totalProfits": profitPercentage
          }
        }
      });
      Object.entries(sectorLevelPriceActions).forEach((sector) => {
        this.options.labels.push(sector[1]["sectorName"])
        this.totalProfits.push(_.round(sector[1]["totalProfits"], 2))
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
