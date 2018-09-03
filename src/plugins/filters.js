import _capitalize from 'lodash/capitalize'
// import _startCase from 'lodash/startCase'
import _filter from 'lodash/filter'

function titleCase( str ){
  return str.split(' ').map( w => _capitalize(w) ).join(' ')
}

export default {
  install( Vue, options ){
    Vue.filter('capitalize', _capitalize)
    Vue.filter('titleCase', titleCase)
    Vue.filter('filter', _filter)
  }
}
