// Helpers for https://www.gbif.org/developer
// ---------------------------------------

import axios from 'axios'
import { setupCache } from 'axios-cache-adapter'

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
  vernacularNameList = vernacularNameList.map( n => n.vernacularName ).join(', ')
  return { ...entry, vernacularNameList }
}

export function searchByCommonName( q ){
  var params = {
    rank: 'SPECIES'
    , qField: 'VERNACULAR'
    , q
  }
  return gbif('/species/search', { params })
    .then( res => res.data.results.map( setVernacularNames ) )
}

export function findByName( name ){
  var params = {
    name
  }
  return gbif('/species', { params })
    .then( res => res.data.results.map( setVernacularNames ) )
}
