// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './app'
import router from './router'
import filter from 'lodash/filter'
import Buefy from 'buefy'
import 'buefy/lib/buefy.css'
Vue.use(Buefy, {
  defaultContainerElement: '#app'
  // , defaultIconPack: 'fas'
})

Vue.filter('filter', filter)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app'
  , router
  , components: { App }
  , template: '<App/>'
})
