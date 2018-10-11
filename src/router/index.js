import Vue from 'vue'
import Router from 'vue-router'
import PageTOL from '@/pages/tol'
import _castArray from 'lodash/castArray'
import _uniq from 'lodash/uniq'
import _compact from 'lodash/compact'
import _get from 'lodash/get'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/'
      , name: 'index'
      , component: PageTOL
      , props: (route) => ({
        ids: _compact(_uniq(_castArray(route.query.ids)))
        , wideMode: !!_get(route.query, 'w', false)
        , horizontalMode: !!_get(route.query, 'h', false)
        , hideImages: !!_get(route.query, 'im', false)
      })
    }
  ]
})
