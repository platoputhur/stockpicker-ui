import Vue from 'vue'
import axios from 'axios'
import VueAxios from "vue-axios";

Vue.use(VueAxios, axios)
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? 'https://stockapi.techtuft.com/' : 'http://localhost:8000/'
export default {}
