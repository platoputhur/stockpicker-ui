<template>
<v-card>
  <v-data-table
      :headers="headers"
      :items="priceActionsForTable"
      :items-per-page="10"
      class="elevation-1"
      dark
  >
    <template v-slot:header >
      <thead>
      <tr>
        <th></th>
        <th></th>
        <th colspan="2" class="text--black text-h6">{{ daym2 }}</th>
        <th colspan="2" class="text--black text-h6">{{ daym1 }}</th>
        <th colspan="2" class="text--black text-h6">{{ daym0 }}</th>
        <th></th>
        <th></th>
      </tr>
      </thead>
    </template>
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template v-slot:item.stockName="{ item }">
      <a v-if="item.stockDetailsUrl"
         target="_blank"
         :href="item.stockDetailsUrl"
         class="teal--text text--lighten-3 text-decoration-none">
        <span class="">{{ item.stockName }}</span>
      </a>
      <span v-else>{{ item.stockName }}</span>
    </template>
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template v-slot:item.sectorName="{ item }">
      <span v-if="item.sectorName">
        <a v-if="item.sectorDetailsUrl"
           target="_blank"
           :href="item.sectorDetailsUrl"
           class="teal--text text--lighten-3 text-decoration-none">
          <span v-if="shortenSectorName(item.sectorName).length > 1" class="">
            <v-tooltip top color="teal">
              <template v-slot:activator="{ on, attrs }">
                <span
                    dark
                    v-bind="attrs"
                    v-on="on"
                >
                  {{ shortenSectorName(item.sectorName)[0] + "..." }}
                </span>
              </template>
              <span>{{ item.sectorName }}</span>
            </v-tooltip>
          </span>
          <span v-else>
            {{ shortenSectorName(item.sectorName)[0] }}
          </span>
        </a>
        <span v-else>
          <span v-if="shortenSectorName(item.sectorName).length > 1" class="">
            <v-tooltip top color="teal">
              <template v-slot:activator="{ on, attrs }">
                <span
                    dark
                    v-bind="attrs"
                    v-on="on"
                >
                  {{ shortenSectorName(item.sectorName)[0] + "..." }}
                </span>
              </template>
              <span>{{ item.sectorName }}</span>
            </v-tooltip>
          </span>
          <span v-else>
            {{ shortenSectorName(item.sectorName)[0] }}
          </span>
        </span>
      </span>
      <span v-else>
        N/A
      </span>
    </template>
  </v-data-table>
  <ErrorPopup v-if="errorFlag"  :error-message="errorMessage"/>
</v-card>
</template>

<script>
import ErrorPopup from "@/components/ErrorPopup";
import _ from 'lodash';

export default {
  name: "ShortListedStocks",
  components: {
    ErrorPopup
  },
  metaInfo: {
    title: 'Shortlist'
  },
  data() {
    return {
      shortListedStocks: [],
      errorFlag: false,
      errorMessage: "",
      headers: [
        {
          text: 'Stock Name',
          align: 'start',
          sortable: false,
          value: 'stockName',
        },
        { text: 'Sector', value: 'sectorName' },
        { text: 'Opening', value: 'dminus2start' },
        { text: 'Closing', value: 'dminus2end' },
        { text: 'Opening', value: 'dminus1start' },
        { text: 'Closing', value: 'dminus1end' },
        { text: 'Opening', value: 'dminus0start' },
        { text: 'Closing', value: 'dminus0end' },
        { text: 'Average Gain', value: 'avg' },
        { text: 'Profit %', value: 'profit' },
      ],
      priceActionsForTable: [],
      daym0: "",
      daym1: "",
      daym2: "",
    };
  },
  mounted() {
    const apiUrl = "https://stockapi.techtuft.com/shortlist/get/latest"
    // const apiUrl = "http://localhost:8000/shortlist/get/latest"

    this.axios.get(apiUrl).then((response) => {
      if (response.data.success === true) {
        this.shortListedStocks = response.data.shortlisted_stocks;
        this.populateTableData(this.shortListedStocks);
        this.daym0 = this.shortListedStocks[0].price_actions[0].price_date;
        this.daym1 = this.shortListedStocks[0].price_actions[1].price_date;
        this.daym2 = this.shortListedStocks[0].price_actions[2].price_date;
      } else {
        this.errorMessage = response.data.message;
      }
    })
    .catch((error) => {
      this.errorFlag = true;
      this.errorMessage = error.message;
    })
  },
  methods: {
    getOpeningAndClosingPrices(priceAction) {
      let hourly_prices = [
        priceAction.hour_1_start,
        priceAction.hour_1_end,
        priceAction.hour_2_start,
        priceAction.hour_2_end,
        priceAction.hour_3_start,
        priceAction.hour_3_end,
        priceAction.hour_4_start,
        priceAction.hour_4_end,
        priceAction.hour_5_start,
        priceAction.hour_5_end,
        priceAction.hour_6_start,
        priceAction.hour_6_end,
        priceAction.hour_7_start,
        priceAction.hour_7_end
      ];
      hourly_prices = hourly_prices.filter(price => price !== 0)
      return [hourly_prices[0], hourly_prices[hourly_prices.length - 1]];
    },
    getAverageGain(priceAction) {
      let day_1_diff = this.getOpeningAndClosingPrices(priceAction.price_actions[2])[1] - this.getOpeningAndClosingPrices(priceAction.price_actions[2])[0];
      let day_2_diff = this.getOpeningAndClosingPrices(priceAction.price_actions[1])[1] - this.getOpeningAndClosingPrices(priceAction.price_actions[1])[0];
      let day_3_diff = this.getOpeningAndClosingPrices(priceAction.price_actions[0])[1] - this.getOpeningAndClosingPrices(priceAction.price_actions[0])[0];
      return _.round((day_1_diff + day_2_diff + day_3_diff) / 3, 2);
    },
    getProfitPercentage(priceAction) {
      let day_1_percentage = (this.getOpeningAndClosingPrices(priceAction.price_actions[2])[1] - this.getOpeningAndClosingPrices(priceAction.price_actions[2])[0])/this.getOpeningAndClosingPrices(priceAction.price_actions[2])[0] * 100;
      let day_2_percentage = (this.getOpeningAndClosingPrices(priceAction.price_actions[1])[1] - this.getOpeningAndClosingPrices(priceAction.price_actions[1])[0])/this.getOpeningAndClosingPrices(priceAction.price_actions[1])[0] * 100;
      let day_3_percentage = (this.getOpeningAndClosingPrices(priceAction.price_actions[0])[1] - this.getOpeningAndClosingPrices(priceAction.price_actions[0])[0])/this.getOpeningAndClosingPrices(priceAction.price_actions[0])[0] * 100;
      return _.round((day_1_percentage + day_2_percentage + day_3_percentage) / 3, 2);
    },
    populateTableData() {
      this.shortListedStocks.forEach(stock => {
        let paObject = {
          stockName: this.convertToTitleCase(stock.stock_name.replace("-", " ")),
          stockDetailsUrl: stock.stock_url,
          sectorDetailsUrl: stock.stock_sector_url,
          sectorName: stock.stock_sector_name,
          dminus2start: this.getOpeningAndClosingPrices(stock.price_actions[2])[0],
          dminus2end: this.getOpeningAndClosingPrices(stock.price_actions[2])[1],
          dminus1start: this.getOpeningAndClosingPrices(stock.price_actions[1])[0],
          dminus1end: this.getOpeningAndClosingPrices(stock.price_actions[1])[1],
          dminus0start: this.getOpeningAndClosingPrices(stock.price_actions[0])[0],
          dminus0end: this.getOpeningAndClosingPrices(stock.price_actions[0])[1],
          avg: this.getAverageGain(stock),
          profit: this.getProfitPercentage(stock),
        }
        this.priceActionsForTable.push(paObject);
      });
    },
    convertToTitleCase(word_or_sentence) {
      return word_or_sentence.toLowerCase().split(' ').map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
      }).join(' ');
    },
    shortenSectorName(sectorName) {
      return String(sectorName).split(" ");
    }
  },
}
</script>

<style scoped>

</style>
