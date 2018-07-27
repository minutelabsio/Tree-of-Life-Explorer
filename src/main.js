// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './app'
import router from './router'
import Filters from './plugins/filters'
import VueTruncate from 'vue-truncate-filter'
import VueMotion from 'vue-motion'
import Buefy from 'buefy'
import './styles/main.scss'
Vue.use(Buefy, {
  defaultContainerElement: '#app'
  // , defaultIconPack: 'fas'
})

Vue.use(Filters)
Vue.use(VueTruncate)
Vue.use(VueMotion)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app'
  , router
  , components: { App }
  , template: '<App/>'
})
