// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './app'
import router from './router'
import Filters from './plugins/filters'
import VueMotion from 'vue-motion'
import VueTour from 'vue-tour'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import Buefy from 'buefy'

// require styles
import 'swiper/dist/css/swiper.css'
import 'vue-tour/dist/vue-tour.css'
import './styles/main.scss'

Vue.use(Buefy, {
  defaultContainerElement: '#app .below-nav'
  // , defaultIconPack: 'fas'
})

Vue.use(Filters)
Vue.use(VueMotion)
Vue.use(VueTour)
Vue.use(VueAwesomeSwiper)

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
    , isTouch: false
  })
  , components: { App, MetaInfoComponent }
  , template: '<App><MetaInfoComponent :show.sync="showMetaInfo"/></App>'
  , created(){
    const checkTouch = () => {
      this.isTouch = true
      document.removeEventListener('touchstart', checkTouch)
    }
    document.addEventListener('touchstart', checkTouch)
  }
  , computed: {
  }
})
