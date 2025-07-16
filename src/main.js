import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import HighchartsVue from 'highcharts-vue'
import * as Highcharts from "highcharts";
import "highcharts/modules/stock";

const app = createApp(App)

import {library} from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { faChartBar } from '@fortawesome/free-regular-svg-icons'

library.add(faChartBar)


app.use(router)
app.use(HighchartsVue)

app.component('font-awesome-icon', FontAwesomeIcon).mount('#app')
