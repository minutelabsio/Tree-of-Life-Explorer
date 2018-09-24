// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './app'
import router from './router'
import Filters from './plugins/filters'
import VueMotion from 'vue-motion'
import Buefy from 'buefy'
import './styles/main.scss'
Vue.use(Buefy, {
  // defaultContainerElement: '#app'
  // , defaultIconPack: 'fas'
})

Vue.use(Filters)
Vue.use(VueMotion)

Vue.config.productionTip = false

const MetaInfoComponent = {
  props: ['show']
  , template: (function(){
    let el = document.getElementById('meta-info')
    let html = el.innerHTML
    el.parentNode.removeChild(el)
    return html
  })()
  , computed: {
    showInfo: {
      get(){
        return this.show
      }
      , set( val ){
        this.$emit('update:show', val)
      }
    }
  }
}

/* eslint-disable no-new */
new Vue({
  el: '#app'
  , router
  , data: () => ({
    showMetaInfo: false
  })
  , components: { App, MetaInfoComponent }
  , template: '<App><MetaInfoComponent :show.sync="showMetaInfo"/></App>'
  , computed: {
  }
})
