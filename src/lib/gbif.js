// Helpers for https://www.gbif.org/developer
// ---------------------------------------

import Promise from 'bluebird'
import axios from 'axios'
import { setupCache } from 'axios-cache-adapter'
import _startCase from 'lodash/startCase'
import _uniq from 'lodash/uniq'
import _union from 'lodash/union'
import _flow from 'lodash/flow'

const cache = setupCache({
  maxAge: 15 * 60 * 1000
})

const gbif = axios.create({
  baseURL: 'http://api.gbif.org/v1'
  , timeout: 5000
  , adapter: cache.adapter
})

function setVernacularNames( entry ){
  if ( !entry.vernacularNames ){
    entry.vernacularNames = []

    if ( entry.vernacularName ){
      entry.vernacularNames.push({ vernacularName: entry.vernacularName, language: 'eng' })
    }
  }

  var vernacularNameList = entry.vernacularNames.filter(n => n.language === 'eng')
  vernacularNameList = vernacularNameList.map( _flow([
    n => n.vernacularName
    , _startCase
  ]) )
  vernacularNameList = _uniq(vernacularNameList).join(', ')
  return { ...entry, vernacularNameList }
}

export function getById( id ){
  return Promise.resolve( gbif(`/species/${id}`) )
    .then( res => setVernacularNames( res.data ) )
}

export function findByCommonName( q ){
  var params = {
    rank: 'SUBSPECIES'
    , qField: 'VERNACULAR'
    , q
  }
  return Promise.join(
    gbif('/species/search', { params })
    , gbif('/species/search', { params: {...params, rank: 'SPECIES'} })
    , ( subspecies, species ) => _union(subspecies.data.results, species.data.results)
  ).then( results => results.map( setVernacularNames ) )
}

export function findByName( name ){
  var params = {
    name
  }
  return Promise.resolve( gbif('/species', { params }) )
    .then( res => res.data.results.map( setVernacularNames ) )
}
