import _capitalize from 'lodash/capitalize'
import _startCase from 'lodash/startCase'
import _filter from 'lodash/filter'

export default {
  install( Vue, options ){
    Vue.filter('capitalize', _capitalize)
    Vue.filter('titleCase', _startCase)
    Vue.filter('filter', _filter)
  }
}
