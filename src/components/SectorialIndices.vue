<template>
  <v-card dark>
    <v-card-title class="align-baseline">
      Sectorial Indices
    </v-card-title>
    <template>
      <v-data-table
          :headers="headers"
          :items="sectorialIndicesForTable"
          :items-per-page="10"
          class="elevation-1"
          :loading="loadingFlag"
          :single-expand="true"
          :expanded.sync="expanded"
          item-key="index_key"
          show-expand
          multi-sort
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
      >
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.market_movement="{ item }">
          <span v-if="item.positive_movement === true">
            <v-chip
                color="green"
                label
                dark
                small
            >
              {{ item.market_movement }}
            </v-chip>
          </span>
          <span v-else>
            <v-chip
              v-if="checkIfIndexHadNoMovement(item)"
              color="grey"
              label
              dark
              small
            >
              {{ item.market_movement }}
            </v-chip>
            <v-chip v-else
              color="red"
              label
              dark
              small
            >
              {{ item.market_movement }}
            </v-chip>
          </span>
        </template>
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            Sub Sectors:
            <ul>
              <li v-for="subSector in item.sectors" :key="subSector.sector_url">
                <a :href="subSector.sector_url">{{ subSector.sector_name }}</a>
                <span> ({{ getStocksCountForSubSector(subSector.sector_url) }} Stocks) </span>
              </li>
            </ul>
          </td>
        </template>
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.stocks_count="{ item }">
          <span>
              {{ item.stocks_count }}
          </span>
        </template>
      </v-data-table>
    </template>
  </v-card>
</template>

<script>
import _ from 'lodash';
export default {
  name: "SectorialIndices",
  data() {
    return {
      expanded: [],
      sectorialIndicesWithDetails: [],
      sectorialIndicesForTable: [],
      errorMessage: "",
      errorFlag: false,
      loadingFlag: false,
      sortBy: ['stocks_count', 'index_value'],
      sortDesc: true,
      headers: [
        {
          text: 'Name',
          align: 'start',
          sortable: false,
          value: 'index_name',
        },
        { text: 'Index', value: 'index_value' },
        { text: 'Movement', value: 'market_movement', sortable: false },
        { text: 'Stocks Count', value: 'stocks_count' },
      ]
    }
  },
  computed: {
    priceActions() {
      return this.$store.getters['getPriceActions'];
    }
  },
  watch: {
    priceActions() {
      this.getSectorIndicesDetails(this.priceActions)
    }
  },
  methods: {
    getSectorIndicesDetails(priceActions) {
      let sectorDetails = []
      priceActions.forEach(priceAction => {
        let details = {
          "sectorName": priceAction.sectorName,
          "sectorDetailsUrl": priceAction.sectorDetailsUrl,
        }
        let detailsFound = false
        if (sectorDetails.filter(sector => sector.sectorName === details.sectorName && sector.sectorDetailsUrl === details.sectorDetailsUrl).length > 0) {
          detailsFound = true
        }
        if (detailsFound === false) {
          sectorDetails.push(details)
        }
      })
      // Sends a request with all the sectorial indices urls to the api server
      this.loadingFlag = true
      let indicesDetailsUrl = "scrape/mc/sector/indices"
      this.axios.post(
          indicesDetailsUrl,
          sectorDetails
      ).then((response) => {
        if (response.data.success === true) {
          this.sectorialIndicesWithDetails = response.data.sectorial_indices;
          this.populateTableData()
        } else {
          this.errorMessage = response.data.message;
        }
      })
          .catch((error) => {
            this.errorFlag = true;
            this.errorMessage = error.message;
          }).finally(() => {
        this.loadingFlag = false;
      });
    },
    populateTableData() {
      const sectorWiseStockCount = this.calculateStocksCountForSector()
      for (const index_name in this.sectorialIndicesWithDetails) {
        const index_details = {
          "index_key": _.random(1, 100000),
          "index_name": this.sectorialIndicesWithDetails[index_name].index_name ? this.sectorialIndicesWithDetails[index_name].index_name : "MISC",
          "index_value": _.round(parseFloat(this.sectorialIndicesWithDetails[index_name].index_value.replace(",", "")), 2).toFixed(2),
          "market_movement": this.sectorialIndicesWithDetails[index_name].market_movement,
          "positive_movement": this.sectorialIndicesWithDetails[index_name].positive_movement,
          "sectors": this.sectorialIndicesWithDetails[index_name].sectors,
          "stocks_count": this.getStocksCountForSector(sectorWiseStockCount, this.sectorialIndicesWithDetails[index_name].index_name)
        }
        this.sectorialIndicesForTable.push(index_details)
        // this.expanded = this.sectorialIndicesForTable
      }
    },
    checkIfIndexHadNoMovement(sector_index) {
      const market_movement = sector_index.market_movement
      const regex = /[.%()[a-zA-Z,\s?]*/g;
      return parseInt(market_movement.replace(regex, '')) === 0;
    },
    calculateStocksCountForSector(){
      let stocksCount = {}
      this.priceActions.forEach(priceAction => {
        const sectorUrl = priceAction.sectorDetailsUrl
        if (sectorUrl in stocksCount) {
          stocksCount[sectorUrl] += 1
        } else {
          stocksCount[sectorUrl] = 1
        }
      })
      return stocksCount
    },
    getStocksCountForSector(sectorWiseStockCount, indexName) {
      let stocksCountForSector = 0
      this.sectorialIndicesWithDetails.forEach(sectorialIndex => {
        if (sectorialIndex.index_name === indexName) {
          const sectors = sectorialIndex.sectors
          sectors.forEach(sector => {
            const sectorUrl = sector.sector_url
            if (sectorUrl in sectorWiseStockCount) {
              stocksCountForSector += sectorWiseStockCount[sectorUrl]
            }
          })
        }
      })
      return stocksCountForSector
    },
    getStocksCountForSubSector(subSectorUrl) {
      let stocksCount = 0
      this.priceActions.forEach(priceAction => {
        if (subSectorUrl === priceAction.sectorDetailsUrl) {
            stocksCount += 1
        }
      })
      return stocksCount
    },
  }
}
</script>

<style scoped>

</style>
