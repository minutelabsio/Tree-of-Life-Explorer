// Helpers for https://www.gbif.org/developer
// https://www.gbif.org/developer/registry
// ---------------------------------------
import Promise from 'bluebird'
import axios from 'axios'
import { setupCache } from 'axios-cache-adapter'
import _startCase from 'lodash/startCase'
import _uniq from 'lodash/uniq'
// import _union from 'lodash/union'
import _flow from 'lodash/flow'

const SERVER_TIMEOUT = 10 * 1000

const parseParams = (params) => {
  const keys = Object.keys(params)
  let options = ''

  keys.forEach((key) => {
    const isParamTypeObject = typeof params[key] === 'object'
    const isParamTypeArray = isParamTypeObject && (params[key].length >= 0)

    if (!isParamTypeObject) {
      options += `${key}=${params[key]}&`
    }

    if (isParamTypeObject && isParamTypeArray) {
      params[key].forEach((element) => {
        options += `${key}=${element}&`
      })
    }
  })

  return options ? options.slice(0, -1) : options
}

const langs = ['', 'en', 'eng']

const cache = setupCache({
  maxAge: 15 * 60 * 1000
  , key: req => req.url + JSON.stringify(req.params)
  , exclude: {
    query: false
  }
})

const gbif = axios.create({
  baseURL: 'https://api.gbif.org/v1'
  , timeout: SERVER_TIMEOUT
  , adapter: cache.adapter
  , crossdomain: true
  , paramsSerializer: params => parseParams(params)
})

function setVernacularNames( entry ){
  if ( !entry.vernacularNames ){
    entry.vernacularNames = []

    if ( entry.vernacularName ){
      entry.vernacularNames.push({ vernacularName: entry.vernacularName, language: 'eng' })
    }
  }

  var vernacularNameList = entry.vernacularNames.filter(n => !n.language || langs.indexOf(n.language) > -1)
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
    qField: 'VERNACULAR'
    , status: 'ACCEPTED'
    , dataset_key: 'fab88965-e69d-4491-a04d-e3198b626e52' // NCBI Database
    // , rank: ['SUBSPECIES', 'SPECIES']
    , q
  }
  return gbif('/species/search', { params })
    .then( d => d.data.results )
    .then( results => results.map( setVernacularNames ) )
}

export function findByScientificName( q ){
  var params = {
    qField: 'SCIENTIFIC'
    , status: 'ACCEPTED'
    , dataset_key: 'fab88965-e69d-4491-a04d-e3198b626e52' // NCBI Database
    // , rank: 'SUBSPECIES'
    , q
  }
  return gbif('/species/search', { params })
    .then( d => d.data.results )
    .then( results => results.map( setVernacularNames ) )
}

export function findByName( name ){
  var params = {
    name
  }
  return Promise.resolve( gbif('/species', { params }) )
    .then( res => res.data.results.map( setVernacularNames ) )
}
