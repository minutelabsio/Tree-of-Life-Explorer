// Helpers for OTL api
// https://github.com/OpenTreeOfLife/germinator/wiki/TNRS-API-v3
// ---------------------------------------
import Promise from 'bluebird'
import _castArray from 'lodash/castArray'
import _startsWith from 'lodash/startsWith'
import _find from 'lodash/find'
import _sortBy from 'lodash/sortBy'
import _takeWhile from 'lodash/takeWhile'
import _every from 'lodash/every'
import cacher from './cacher'
import axios from 'axios'

const SERVER_TIMEOUT = 10 * 1000

const otol = axios.create({
  baseURL: 'https://api.opentreeoflife.org/v3'
  // baseURL: 'https://ot39.opentreeoflife.org/v3'
  , timeout: SERVER_TIMEOUT
  , crossdomain: true
})

function getCommonLineage( nodes ){
  let lineages = nodes.map( n => [].concat(n.lineage) )
  lineages.forEach( l => l.reverse() )
  lineages = _sortBy( lineages, l => l.length )
  let longest = lineages.pop()
  let common = _takeWhile( longest, (p, idx) =>
    _every(lineages, l => l[idx] && l[idx].node_id === p.node_id)
  )
  common.pop() // mrca
  common.reverse()
  return common
}

// Get node info
// id can be either node_id or ott_id. It will auto detect
// ---------------------------------------
export const getNode = cacher(function( id ){
  if ( _startsWith( id, 'mrca' ) ){
    return getMRCA( id )
  }
  var idField = typeof id === 'string' ? 'node_id' : 'ott_id'
  var data = {
    [idField]: id
    , include_lineage: true
  }
  return Promise.resolve( otol.post('/tree_of_life/node_info', data) )
    .then( res => res.data )
    .tap( data => {
      if ( data.response_for_mrca_of_broken_taxon ){
        console.error('WARNING: Received response_for_mrca_of_broken_taxon from OTOL')
      }
    })
})

// Get most recent common ancestor of nodes by id or mrca id string
// ---------------------------------------
export function getMRCA( idOrArray ){
  if ( typeof idOrArray === 'string' ){
    idOrArray = idOrArray.match(/(ott[\d]+)/g)
  }

  var data = {
    node_ids: idOrArray
  }
  return Promise.resolve( otol.post('/tree_of_life/mrca', data) )
    .then( res => res.data.mrca )
    .then( data => {
      return Promise.all([
        Promise.map( idOrArray, getNode )
        , data.taxon ? data.taxon : getDescendantNames( data.node_id ).then( childrenNames => ({
          name: `${childrenNames.join(' and ')}`
        }))
      ]).spread( (nodes, taxon) => {
        let lineage = getCommonLineage( nodes )

        data.taxon = taxon

        data.lineage = lineage

        return data
      })
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
export const getNodeByName = cacher(function( name ){
  return getTxResultsByNames( name )
    .then( results => _find(results, {'name': name}) )
    .then( result => {
      if (!result || !result.matches){
        throw new Error('Node not found')
      }

      return result.matches[0].taxon.ott_id
    })
    .then( getNode )
})

export const getOttIdBySource = cacher(function( source ){
  let data = {
    source_id: source
  }

  return Promise.resolve( otol.post('/taxonomy/taxon_info', data) )
    .then( res => res.data.ott_id )
})

export const getSubtree = cacher(function( id, depth = 1 ){
  var idField = _startsWith( id, 'ott' ) || _startsWith( id, 'mrca' ) ? 'node_id' : 'ott_id'
  var data = {
    [idField]: id
    , format: 'arguson'
    , height_limit: depth
  }
  return Promise.resolve( otol.post('/tree_of_life/subtree', data) )
    .then( res => res.data.arguson.children || [] )
})

export const getDescendantNames = cacher(function( id ){
  var idField = _startsWith( id, 'ott' ) || _startsWith( id, 'mrca' ) ? 'node_id' : 'ott_id'
  var data = {
    [idField]: id
    , format: 'arguson'
    , height_limit: 1
  }
  return Promise.resolve( otol.post('/tree_of_life/subtree', data) )
    .then( res => res.data.arguson.descendant_name_list || [] )
})

export function getTxnSourceId( type, node ){
  if ( !node.taxon ){ return null }
  let str = _find(node.taxon.tax_sources, (x) => _startsWith(x, type))
  if ( !str ){
    return null
  }
  return str.replace(`${type}:`, '')
}

export function getGbifId( node ){
  return getTxnSourceId( 'gbif', node )
}

export function getWormsId( node ){
  return getTxnSourceId( 'worms', node )
}
