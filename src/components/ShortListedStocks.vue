<template>
<v-card dark>
  <v-card-title class="align-baseline">
    <span class="mr-10">Short Listed Stocks</span>
    <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
    ></v-text-field>
    <v-btn
        class="ma-2"
        color="blue lighten-2"
        :loading="downloadLoading"
        :disabled="downloadLoading"
        @click="downloadExcelFile"
    >
      Download&nbsp;
      <v-icon>mdi-cloud-download</v-icon>
    </v-btn>
  </v-card-title>
  <v-data-table
      :headers="headers"
      :items="priceActionsForTable"
      :search="search"
      item-key="stockName"
      :items-per-page="10"
      class="elevation-1"
      dark
      :loading="loadingFlag"
      multi-sort
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
  >
    <template v-slot:header >
      <thead>
      <tr>
        <th></th>
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
        <span class="">
          <v-tooltip v-if="item.stockSymbol" top color="teal">
              <template v-slot:activator="{ on, attrs }">
                <span
                    dark
                    v-bind="attrs"
                    v-on="on"
                >
                  {{ item.stockName }} <span class="white--text">&#9432;</span>
                </span>
              </template>
              <span>{{ "SYMBOL: " + item.stockSymbol }}</span>
            </v-tooltip>
            <span v-else>{{ item.stockName }}</span>
        </span>
      </a>
      <span v-else>
        <v-tooltip v-if="item.stockSymbol" top color="teal">
            <template v-slot:activator="{ on, attrs }">
              <span
                  dark
                  v-bind="attrs"
                  v-on="on"
              >
                {{ item.stockName }} <span class="white--text">&#9432;</span>
              </span>
            </template>
            <span>{{ "SYMBOL: " + item.stockSymbol }}</span>
          </v-tooltip>
        <span v-else>{{ item.stockName }}</span>
      </span>
    </template>
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template v-slot:item.intradayAllowed="{ item }">
      <span v-if="item.intradayAllowed === true"> <v-icon light class="green--text">mdi-check-circle</v-icon> </span>
      <span v-else> <v-icon class="red--text">mdi-close-thick</v-icon> </span>
    </template>
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template v-slot:item.dminus2start="{ item }">
      <span class="small-font">{{ item.dminus2start.price }}<small> ({{ item.dminus2start.time }}) </small></span>
    </template>
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template v-slot:item.dminus2end="{ item }">
      <span class="small-font">{{ item.dminus2end.price }}<small> ({{ item.dminus2end.time }}) </small></span>
    </template>
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template v-slot:item.dminus1start="{ item }">
      <span class="small-font">{{ item.dminus1start.price }}<small> ({{ item.dminus1start.time }}) </small></span>
    </template>
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template v-slot:item.dminus1end="{ item }">
      <span class="small-font">{{ item.dminus1end.price }}<small> ({{ item.dminus1end.time }}) </small></span>
    </template>
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template v-slot:item.dminus0start="{ item }">
      <span class="small-font">{{ item.dminus0start.price }}<small> ({{ item.dminus0start.time }}) </small></span>
    </template>
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template v-slot:item.dminus0end="{ item }">
      <span class="small-font">{{ item.dminus0end.price }}<small> ({{ item.dminus0end.time }}) </small></span>
    </template>
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template v-slot:item.avg="{ item }">
      <span class="small-font">{{ item.avg }}</span>
    </template>
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template v-slot:item.profit="{ item }">
      <span class="small-font">{{ item.profit }}</span>
    </template>
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template v-slot:item.bs="{ item }">
      <span class="small-font">Buy:</span> <v-chip
          color="green"
          class="my-1"
          x-small
          label
          dark
      >
        {{ item.bs[0] }}
      </v-chip><br />
      <span class="small-font">Sell:</span> <v-chip
          color="red"
          class="my-1"
          x-small
          label
          dark
      >
        {{ item.bs[1] }}
      </v-chip>
    </template>
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template v-slot:item.sl="{ item }">
      <v-chip
        color="orange"
        x-small
        label
        dark
      >
        {{ item.sl }}
      </v-chip>
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
      search: '',
      shortListedStocks: [],
      errorFlag: false,
      loadingFlag: true,
      downloadLoading: false,
      errorMessage: "",
      sortBy: 'intradayAllowed',
      sortDesc: true,
      headers: [
        {
          text: 'Stock Name',
          align: 'start',
          sortable: false,
          value: 'stockName',
        },
        { text: 'IDO', value: 'intradayAllowed' },
        { text: 'Sector', value: 'sectorName' },
        { text: 'Opening', value: 'dminus2start' },
        { text: 'Closing', value: 'dminus2end' },
        { text: 'Opening', value: 'dminus1start' },
        { text: 'Closing', value: 'dminus1end' },
        { text: 'Opening', value: 'dminus0start' },
        { text: 'Closing', value: 'dminus0end' },
        { text: 'Average Gain', value: 'avg' },
        // { text: '3rd, 5th, 8th Gains', value: 'multiGains' },
        { text: 'Profit %', value: 'profit' },
        { text: 'Buy / Sell Price', value: 'bs' },
        { text: 'Stop Loss', value: 'sl' },
        { text: 'F Profit', value: 'fp' },
      ],
      priceActionsForTable: [],
      daym0: "",
      daym1: "",
      daym2: "",
    };
  },
  props: {
    shortlistOffset: {
      type: Number,
      default: 0
    }
  },
  mounted() {
    let shortListUrl = "shortlist/get/latest"
    if (this.shortlistOffset !== 0) {
      shortListUrl = "shortlist/get/" + this.shortlistOffset
    }
    this.axios.get(shortListUrl).then((response) => {
      if (response.data.success === true) {
        this.shortListedStocks = response.data.shortlisted_stocks;
        this.populateTableData(this.shortListedStocks);
        this.daym0 = this.shortListedStocks[0].price_actions[0].price_date;
        this.daym1 = this.shortListedStocks[0].price_actions[1].price_date;
        this.daym2 = this.shortListedStocks[0].price_actions[2].price_date;
      } else {
        this.errorMessage = response.data.message;
        if (response.data.shortlisted_stocks.length === 0) {
          this.$emit('no-more-shortlisted-stocks-event', this.shortlistOffset);
        }
      }
    })
    .catch((error) => {
      this.errorFlag = true;
      this.errorMessage = error.message;
    }).finally(() => {
      this.loadingFlag = false;
    });
  },
  methods: {
    downloadExcelFile() {
      const self = this
      self.downloadLoading = true;
      self.axios.get(
          "shortlist/download/" + this.shortlistOffset,
          {responseType: 'blob'},
    ).then((response) => {
        let blob = new Blob([response.data]);
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = "shortlist.xlsx";
        link.click();
        self.downloadLoading = false;
      })
    },
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
    getOpeningAndClosingPricesWithTime(priceAction) {
      let hourly_prices = [
        {time: 9, price: priceAction.hour_1_start},
        {time: 10, price: priceAction.hour_1_end},
        {time: 10, price: priceAction.hour_2_start},
        {time: 11, price: priceAction.hour_2_end},
        {time: 11, price: priceAction.hour_3_start},
        {time: 12, price: priceAction.hour_3_end},
        {time: 12, price: priceAction.hour_4_start},
        {time: 1, price: priceAction.hour_4_end},
        {time: 1, price: priceAction.hour_5_start},
        {time: 2, price: priceAction.hour_5_end},
        {time: 2, price: priceAction.hour_6_start},
        {time: 3, price: priceAction.hour_6_end},
        {time: 3, price: priceAction.hour_7_start},
        {time: 4, price: priceAction.hour_7_end},
      ];
      hourly_prices = hourly_prices.filter(hourlyPrice => hourlyPrice.price !== 0)
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
    getBuySellPrices(stock) {
      let buy_price =  _.round(this.getOpeningAndClosingPrices(stock.price_actions[0])[1], 2);
      let sell_price =  _.round(buy_price + this.getAverageGain(stock), 2);
      return [buy_price.toFixed(2), sell_price.toFixed(2)];
    },
    getStopLossPrice(stock) {
      return  _.round(this.getOpeningAndClosingPrices(stock.price_actions[0])[1] - (this.getAverageGain(stock) / 3), 2);
    },
    getForecastedProfit(stock) {
      let b_s = this.getBuySellPrices(stock);
      return _.round((((parseFloat(b_s[1]) - parseFloat(b_s[0]))/parseFloat(b_s[0])) * 100), 2);

    },
    populateTableData() {
      this.shortListedStocks.forEach(stock => {
        let paObject = {
          stockName: this.convertToTitleCase(stock.stock_name.replaceAll("-", " ").trim()),
          stockSymbol: stock.symbol,
          stockDetailsUrl: stock.stock_url,
          sectorDetailsUrl: stock.stock_sector_url,
          intradayAllowed: stock.is_intraday_allowed,
          sectorName: stock.stock_sector_name,
          dminus2start: this.getOpeningAndClosingPricesWithTime(stock.price_actions[2])[0],
          dminus2end: this.getOpeningAndClosingPricesWithTime(stock.price_actions[2])[1],
          dminus1start: this.getOpeningAndClosingPricesWithTime(stock.price_actions[1])[0],
          dminus1end: this.getOpeningAndClosingPricesWithTime(stock.price_actions[1])[1],
          dminus0start: this.getOpeningAndClosingPricesWithTime(stock.price_actions[0])[0],
          dminus0end: this.getOpeningAndClosingPricesWithTime(stock.price_actions[0])[1],
          avg: this.getAverageGain(stock),
          // multiGain: this.getMultiGains(stock),
          profit: this.getProfitPercentage(stock),
          bs: this.getBuySellPrices(stock),
          sl: this.getStopLossPrice(stock).toFixed(2),
          fp: this.getForecastedProfit(stock)
        }
        this.priceActionsForTable.push(paObject);
      });
      this.$store.dispatch('setPriceActions', this.priceActionsForTable);
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
.small-font {
  font-size: 0.8em!important;
}
</style>
