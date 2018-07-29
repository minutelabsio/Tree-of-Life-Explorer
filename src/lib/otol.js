import Promise from 'bluebird'
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
  if ( _startsWith( id, 'mrca' ) ){
    return getMRCA( id )
  }
  var idField = _startsWith( id, 'ott' ) ? 'node_id' : 'ott_id'
  var data = {
    [idField]: id
    , include_lineage: true
  }
  return Promise.resolve( otol.post('/tree_of_life/node_info', data) )
    .then( res => res.data )
})

export function getMRCA( idOrArray ){
  if ( typeof idOrArray === 'string' ){
    idOrArray = idOrArray.match(/(ott[\d]+)/g)
  }

  var data = {
    node_ids: idOrArray
    , nearest_taxon: true
  }
  return Promise.resolve( otol.post('/tree_of_life/mrca', data) )
    .then( res => res.data.mrca )
    .then( data => {
      if (!data.taxon){
        return Promise.map( idOrArray, getNode )
          .then( nodes => {
            let nodelist = nodes.map( n => n.taxon.name ).join(' and ')
            data.taxon = {
              name: `(MRCA of ${nodelist})`
            }

            return data
          })
      }

      return data
    })
}

export function getTxResultsByNames( names = [] ){
  var data = {
    names: _castArray( names )
  }

  return Promise.resolve( otol.post('/tnrs/match_names', data) )
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

export const getSubtree = _memoize(function( id, depth = 1 ){
  var idField = _startsWith( id, 'ott' ) ? 'node_id' : 'ott_id'
  var data = {
    [idField]: id
    , format: 'arguson'
    , height_limit: depth
  }
  return Promise.resolve( otol.post('/tree_of_life/subtree', data) )
    .then( res => res.data.arguson.children || [] )
})

export function getTxnSourceId( type, node ){
  let str = _find(node.taxon.tax_sources, (x) => _startsWith(x, type))
  if ( !str ){
    return str
  }
  return str.replace(`${type}:`, '')
}

export function getGbifId( node ){
  return getTxnSourceId( 'gbif', node )
}

export function getWormsId( node ){
  return getTxnSourceId( 'worms', node )
}
