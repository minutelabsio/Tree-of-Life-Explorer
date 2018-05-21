import Vue from 'vue'
import Router from 'vue-router'
import PageTOL from '@/pages/tol'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/'
      , name: 'index'
      , component: PageTOL
    }
  ]
})
