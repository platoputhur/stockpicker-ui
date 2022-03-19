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
          item-key="index_name"
          show-expand
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
              <li v-for="subSector in item.sectors" :key="subSector.sector_name">
                <a :href="subSector.sector_url">{{ subSector.sector_name }}</a>
              </li>
            </ul>
          </td>
        </template>
      </v-data-table>
    </template>
  </v-card>
</template>

<script>
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
      sortBy: 'market_movement',
      sortDesc: false,
      headers: [
        {
          text: 'Name',
          align: 'start',
          sortable: false,
          value: 'index_name',
        },
        { text: 'Index', value: 'index_value' },
        { text: 'Movement', value: 'market_movement' },
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
      for (const index_name in this.sectorialIndicesWithDetails) {
        const index_details = {
          "index_name": this.sectorialIndicesWithDetails[index_name].index_name ? this.sectorialIndicesWithDetails[index_name].index_name : "MISC",
          "index_value": this.sectorialIndicesWithDetails[index_name].index_value,
          "market_movement": this.sectorialIndicesWithDetails[index_name].market_movement,
          "positive_movement": this.sectorialIndicesWithDetails[index_name].positive_movement,
          "sectors": this.sectorialIndicesWithDetails[index_name].sectors,
        }
        this.sectorialIndicesForTable.push(index_details)
      }
    },
    checkIfIndexHadNoMovement(sector_index) {
      const market_movement = sector_index.market_movement
      const regex = /[.%()[a-zA-Z,\s?]*/g;
      return parseInt(market_movement.replace(regex, '')) === 0;
    }
  }
}
</script>

<style scoped>

</style>
