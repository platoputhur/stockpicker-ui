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
        <th colspan="2" class="text--black text-h6">{{ daym2 }}</th>
        <th colspan="2" class="text--black text-h6">{{ daym1 }}</th>
        <th colspan="2" class="text--black text-h6">{{ daym0 }}</th>
        <th></th>
        <th></th>
      </tr>
      </thead>
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
    this.axios.get("http://127.0.0.1:8000/shortlist/get/latest").then((response) => {
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
    }
  }
}
</script>

<style scoped>

</style>
