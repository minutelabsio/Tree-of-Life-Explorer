import _castArray from 'lodash/castArray'
import _startsWith from 'lodash/startsWith'
import _find from 'lodash/find'
import _memoize from 'lodash/memoize'
import axios from 'axios'

const otol = axios.create({
  baseURL: 'https://api.opentreeoflife.org/v3'
  , timeout: 5000
})

// Get node info
// id can be either node_id or ott_id. It will auto detect
// ---------------------------------------
export const getNode = _memoize(function( id ){
  var idField = _startsWith( id, 'ott' ) ? 'node_id' : 'ott_id'
  var data = {
    [idField]: id
    , include_lineage: true
  }
  return otol.post('/tree_of_life/node_info', data)
    .then( res => res.data )
})

export function getTxResultsByNames( names = [] ){
  var data = {
    names: _castArray( names )
  }

  return otol.post('/tnrs/match_names', data)
    .then( res => res.data.results )
}

// Helper for finding a OTOL node by its tx name
export const getNodeByName = _memoize(function( name ){
  return getTxResultsByNames( name )
    .then( results => _find(results, {'name': name}) )
    .then( result => {
      if (!result){
        throw new Error('Node not found')
      }

      return result.matches[0].taxon.ott_id
    })
    .then( getNode )
})

export function getGbifId( node ){
  return _find(node.taxon.tax_sources, (x) => _startsWith(x, 'gbif')).replace('gbif:', '')
}
