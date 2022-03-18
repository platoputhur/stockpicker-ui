import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    priceActions: []
  },
  getters: {
    getPriceActions: state => state.priceActions
  },
  mutations: {
    SET_PRICE_ACTIONS(state, priceActions) {
      state.priceActions = priceActions
    },
    GET_PRICE_ACTIONS(state) {
      return state.priceActions
    },
  },
  actions: {
    setPriceActions({ commit }, priceActions) {
      commit('SET_PRICE_ACTIONS', priceActions)
    },
    getPriceActions({ commit }) {
      commit('GET_PRICE_ACTIONS')
    },
  },
  modules: {
  }
})
