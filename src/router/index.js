import Vue from 'vue'
import Router from 'vue-router'
import PageTOL from '@/pages/tol'
import _castArray from 'lodash/castArray'
import _uniq from 'lodash/uniq'
import _compact from 'lodash/compact'
import _get from 'lodash/get'

Vue.use(Router)

function getOption( query, name ){
  return !!parseInt(_get(query, name, 0))
}

export default new Router({
  routes: [
    {
      path: '/'
      , name: 'index'
      , component: PageTOL
      , props: (route) => ({
        ids: _compact(_uniq(_castArray(route.query.ids)))
        , wideMode: getOption(route.query, 'w')
        , horizontalMode: getOption(route.query, 'h')
        , hideImages: getOption(route.query, 'im')
      })
    }
  ]
})
