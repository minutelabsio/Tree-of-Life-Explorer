import _capitalize from 'lodash/capitalize'
import _filter from 'lodash/filter'

export default {
  install( Vue, options ){
    Vue.filter('capitalize', _capitalize)
    Vue.filter('filter', _filter)
  }
}
