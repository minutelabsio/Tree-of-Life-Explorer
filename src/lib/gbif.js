// Helpers for https://www.gbif.org/developer
// ---------------------------------------

import axios from 'axios'
const gbif = axios.create({
  baseURL: 'http://api.gbif.org/v1'
  , timeout: 1000
})

function setVernacularNames( entry ){
  if ( !entry.vernacularNames ){
    entry.vernacularNames = []

    if ( entry.vernacularName ){
      entry.vernacularNames.push( entry.vernacularName )
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
