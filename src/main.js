import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import HighchartsVue from 'highcharts-vue'
import * as Highcharts from "highcharts";
import "highcharts/modules/stock";
import { createNotivue } from 'notivue'

import 'notivue/notification.css' // Only needed if using built-in notifications
import 'notivue/animations.css' // Only needed if using built-in animations
import 'notivue/notification-progress.css'

const notivue = createNotivue({
  position: 'top-right',
  limit: 3,
  enqueue: true,
  avoidDuplicates: true,
  notifications: {
    global: {
      duration: 10000
    }
  }
})

const app = createApp(App)

app.use(notivue)

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { faChartBar } from '@fortawesome/free-regular-svg-icons'

library.add(faChartBar)


app.use(router)
app.use(HighchartsVue)

app.component('font-awesome-icon', FontAwesomeIcon).mount('#app')
