import Vue from 'vue'
import Router from 'vue-router'
import PageTOL from '@/pages/tol'
import _castArray from 'lodash/castArray'
import _uniq from 'lodash/uniq'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/'
      , name: 'index'
      , component: PageTOL
      , props: (route) => ({ names: _uniq(_castArray(route.query.names)) })
    }
  ]
})
