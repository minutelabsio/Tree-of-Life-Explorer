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

    Vue.filter('nodeName', function( node ){
      if (node.taxon){
        return node.taxon.name
      }
      if (node.descendant_name_list){
        return node.descendant_name_list.join(' and ')
      }
      return node.node_id
    })
  }
}
