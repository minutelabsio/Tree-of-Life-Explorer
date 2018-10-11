import Vue from 'vue'
import Router from 'vue-router'
import PageTOL from '@/pages/tol'
import _castArray from 'lodash/castArray'
import _uniq from 'lodash/uniq'
import _compact from 'lodash/compact'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/'
      , name: 'index'
      , component: PageTOL
      , props: (route) => ({
        ids: _compact(_uniq(_castArray(route.query.ids)))
        , wideMode: !!route.query.w
        , horizontalMode: !!route.query.h
        , hideImages: !!route.query.im
      })
    }
  ]
})
