import Promise from 'bluebird'
import _union from 'lodash/union'
import _get from 'lodash/get'
import _mergeWith from 'lodash/mergeWith'
import _isArray from 'lodash/isArray'
import cacher from '@/lib/cacher'
import * as otol from '@/lib/otol'
import * as gbif from '@/lib/gbif'
// import * as worms from '@/lib/worms'
import * as wikidata from '@/lib/wikidata'
import * as wikimedia from '@/lib/wikimedia'

const gbifMapping = {
  'key': false
  , 'nubKey': false
  , 'nameKey': false
  , 'taxonID': false
  , 'sourceTaxonKey': false
  , 'kingdom': true
  , 'phylum': true
  , 'kingdomKey': false
  , 'phylumKey': false
  , 'datasetKey': false
  , 'constituentKey': false
  , 'parentKey': false
  , 'parent': true
  , 'scientificName': true
  , 'canonicalName': true
  , 'vernacularName': true
  , 'vernacularNames': true
  , 'vernacularNameList': true
  , 'authorship': true
  , 'nameType': false
  , 'rank': true
  , 'origin': false
  , 'taxonomicStatus': 'status'
  , 'nomenclaturalStatus': false
  , 'remarks': false
  , 'numDescendants': true
  , 'lastCrawled': false
  , 'lastInterpreted': false
  , 'issues': false
  , 'synonym': false
}

// const wormsMapping = {
//   'AphiaID': false
//   , 'url': false
//   , 'scientificname': 'canonicalName'
//   , 'authority': false
//   , 'rank': 'rank'
//   , 'status': false
//   , 'unacceptreason': false
//   , 'valid_AphiaID': false
//   , 'valid_name': false
//   , 'valid_authority': false
//   , 'kingdom': true
//   , 'phylum': true
//   , 'class': true
//   , 'order': true
//   , 'family': true
//   , 'genus': true
//   , 'citation': false
//   , 'lsid': false
//   , 'isMarine': false
//   , 'isBrackish': false
//   , 'isFreshwater': false
//   , 'isTerrestrial': false
//   , 'isExtinct': true
//   , 'match_type': false
//   , 'modified': false
// }

// function mapWikidataImages( data ){
//   return data.reduce( (output, entry) => {
//     output.wikidataImages.push(entry.pic)
//     return output
//   }, { wikidataImages: [] })
// }

export function getMapping( data = {}, mapping ){
  return Object.keys( mapping ).reduce( (obj, key) => {
    let m = mapping[ key ]
    if ( !m ){ return obj }
    if ( m === true ){
      m = key
    }

    obj[ m ] = data[ key ]
    if ( typeof obj[ m ] === 'string' ){
      obj[ m ] = obj[ m ].toLowerCase()
    }

    return obj
  }, {})
}

function ensureVernacularNames( node, txn ){
  if ( txn.vernacularNameList && txn.vernacularNameList.length ){
    return txn
  }

  if ( !node.taxon ){ return txn }

  return gbif.findByScientificName( node.taxon.unique_name )
    .then( results => results[0] )
    .then( data => getMapping( data, gbifMapping ) )
    .then( data => ({ ...txn, ...data }) )
}

export function getTaxonomyInfo( node ){

  var types = {
    'gbif': ( id ) => gbif.getById( id ).then( data => getMapping( data, gbifMapping ) )
    // , 'worms': ( id ) => worms.getById( id ).then( data => getMapping( data, wormsMapping ) )
  }

  var queries = []

  let txnInfoQueries = Promise.map( Object.keys(types), (type) => {
    let id = otol.getTxnSourceId( type, node )
    if ( !id ){
      return null
    }

    return types[ type ]( id )
  } )

  queries.push( txnInfoQueries )

  return Promise.all(queries)
    .then( resultList => _union(...resultList) )
    .then( results => results.reduce( (txn, data) => ({...txn, ...data}), {} ) )
    .then( txn => ensureVernacularNames(node, txn) )
}

function toHTTPS( images ){
  if ( !images || !images.map ){ return images }
  return images.map( url => url.replace('http:', 'https:') )
}

export function getImagesAndCommonNames( name, ncbiId, options = {} ){

  return wikidata.findInfoBy({ ncbiId, name })
    .then( data => {
      let firstResult = (data && data[0]) || {}

      if ( options.images === false ){
        return firstResult
      }

      return wikimedia.findImagesByName( name, { thumbSize: options.thumbSize } )
        .then( data => {
          firstResult.pic = _union(data.map( item => _get( item, 'image.url' ) ), options.getAllImages ? firstResult.pic : [])
          firstResult.thumbnail = _union(data.map( item => _get( item, 'image.thumburl' ) ))
          return firstResult
        })
    })
    .then( data => {
      data.pic = toHTTPS( data.pic )
      data.thumbnail = toHTTPS( data.thumbnail )
      return data
    })
}

export function isMRCA( leaf ){
  return leaf.node_id.indexOf('mrca') === 0
}

export const getTxnInfo = cacher(Promise.coroutine(function* ( leaf, options ){
  if ( !leaf.taxon ){
    leaf = yield getLeaf( leaf.node_id )
  }

  let getAllImages = ['species', 'subspecies', 'variety'].indexOf(leaf.taxon.rank) === -1

  if ( isMRCA(leaf) ){
    let names = leaf.taxon.name.split(' and ')
    return Promise.map( names, name =>
      getImagesAndCommonNames( name, null, {getAllImages, thumbSize: options.thumbSize, images: options.images} )
    ).then( results => {
      return _mergeWith({}, leaf.taxon, ...results, (objValue, srcValue) => {
        if ( _isArray(objValue) ) {
          return objValue.concat(srcValue)
        }
      })
    })
  }

  let ncbiId = otol.getTxnSourceId( 'ncbi', leaf )

  return Promise.all([
    getTaxonomyInfo( leaf )
    , getImagesAndCommonNames( leaf.taxon.unique_name, ncbiId, {getAllImages, thumbSize: options.thumbSize, images: options.images} )
  ]).spread( (txnInfo, imgNameData) => {
    return Object.assign({}, leaf.taxon, txnInfo, imgNameData)
  })
}))

function Leaf( node ){
  return {
    ...node
  }
}

export function getLeaf( id ){
  return otol.getNode( id ).then( node =>
    Leaf( node )
  )
}
