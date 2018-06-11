import Promise from 'bluebird'
import * as otol from '@/lib/otol'
import * as gbif from '@/lib/gbif'
import * as worms from '@/lib/worms'

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

const wormsMapping = {
  'AphiaID': false
  , 'url': false
  , 'scientificname': 'canonicalName'
  , 'authority': false
  , 'rank': 'rank'
  , 'status': false
  , 'unacceptreason': false
  , 'valid_AphiaID': false
  , 'valid_name': false
  , 'valid_authority': false
  , 'kingdom': true
  , 'phylum': true
  , 'class': true
  , 'order': true
  , 'family': true
  , 'genus': true
  , 'citation': false
  , 'lsid': false
  , 'isMarine': false
  , 'isBrackish': false
  , 'isFreshwater': false
  , 'isTerrestrial': false
  , 'isExtinct': true
  , 'match_type': false
  , 'modified': false
}

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

export function getTaxonomyInfo( node, mapping ){
  var types = {
    'gbif': ( id ) => gbif.getById( id ).then( data => getMapping( data, gbifMapping ) )
    , 'worms': ( id ) => worms.getById( id ).then( data => getMapping( data, wormsMapping ) )
  }

  return Promise.map( Object.keys(types), (type) => {
    let id = otol.getTxnSourceId( type, node )
    if ( !id ){
      return null
    }

    return types[ type ]( id )
  } ).then( results => results.reduce( (txn, data) => ({...txn, ...data}), {} ) )
}
