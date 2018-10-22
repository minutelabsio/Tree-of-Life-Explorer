// Helpers for https://query.wikidata.org
// ---------------------------------------
import Promise from 'bluebird'
import axios from 'axios'
import { setupCache } from 'axios-cache-adapter'
import _pick from 'lodash/pick'
import _groupBy from 'lodash/groupBy'
import _transform from 'lodash/transform'
import _omit from 'lodash/omit'
import _values from 'lodash/values'
import _mapValues from 'lodash/mapValues'
import Throttler from './throttler'

const SERVER_TIMEOUT = 10 * 1000

const cache = setupCache({
  maxAge: 15 * 60 * 1000
  , exclude: {
    query: false
  }
})

const wikidata = axios.create({
  baseURL: 'https://query.wikidata.org'
  , headers: {
    'Accept': 'application/sparql-results+json'
    // , 'Access-Control-Allow-Origin': '*'
  }
  , params: {
    // origin: window.location.origin
  }
  , crossdomain: true
  , timeout: SERVER_TIMEOUT
  , adapter: cache.adapter
})

const throttler = new Throttler( 200, 3 )

wikidata.interceptors.request.use( config => throttler.schedule( config ) )

function getItemId( url = '' ){
  let m = url.match(/\/([A-z1-9]+$)/)
  return (m && m[1]) || ''
}

function assembleByItem( results ){
  const singleProps = ['item', 'itemId', 'itemLabel']
  // get array of results of objects
  let items = _groupBy( results, 'itemId' )
  // want them grouped by itemId
  return _values(items).map( ( parts ) => {
    // map the array into an object of array properties
    // take the first one and use it to set the base object
    let item = _pick(parts[0], singleProps)
    return _transform( parts, (result, part) => {
      Object.keys(_omit(part, singleProps)).forEach( key => {
        result[key] = result[key] || []
        if ( result[key].indexOf(part[key]) < 0 ){
          result[key].push( part[key] )
        }
      })
      return result
    }, item )
  } )
}

wikidata.interceptors.response.use(function (response) {
  // make it work with cache adaptor
  if ( response.request.fromCache ){
    return response
  }
  // Do something with response data
  const { head: { vars }, results } = response.data
  response.data = results.bindings.map( item =>
    Object.assign({ itemId: getItemId(item.item.value) }, _mapValues(_pick(item, vars), 'value'))
  )
  response.data = assembleByItem(response.data)
  return response
}, function (error) {
  console.dir(error)
  // just return
  return Promise.reject(error)
})

export function findInfoByNcbiId( ncbiId, { limit, lang } = {} ){

  const sparqlQuery = `SELECT ?item ?itemLabel ?pic ?commonName WHERE {
    ?item wdt:P685 "${ncbiId}".
    OPTIONAL { ?item wdt:P18 ?pic. }
    OPTIONAL { ?item wdt:P1843 ?commonName FILTER (lang(?commonName) = '${lang || 'en'}'). }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  }
  LIMIT ${limit || 10}`

  return Promise.resolve( wikidata('sparql?query=' + encodeURIComponent( sparqlQuery )) )
    .then( res => res.data )
}

export function findInfoByScientificName( name, { limit, lang } = {} ){

  const sparqlQuery = `SELECT ?item ?itemLabel ?pic ?commonName WHERE {
    ?item wdt:P225 "${name}".
    OPTIONAL { ?item wdt:P18 ?pic. }
    OPTIONAL { ?item wdt:P1843 ?commonName FILTER (lang(?commonName) = '${lang || 'en'}'). }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  }
  LIMIT ${limit || 10}`

  return Promise.resolve( wikidata('sparql?query=' + encodeURIComponent( sparqlQuery )) )
    .then( res => res.data )
}

export function findInfoByCommonName( q, { limit } = {} ){

  if ( !q ){
    return Promise.resolve([])
  }

  const sparqlQuery = `SELECT DISTINCT ?item ?scientificName ?pic ?commonName WHERE {
    ?item wdt:P1843 ?commonName FILTER regex(?commonName, "${q}", "i").
    { ?item wdt:P105 wd:Q7432. }
    UNION
    { ?item wdt:P105 wd:Q68947. }
    ?item wdt:P225 ?scientificName.
    OPTIONAL { ?item wdt:P18 ?pic. }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  }
  LIMIT ${limit || 10}`

  return Promise.resolve( wikidata('sparql?query=' + encodeURIComponent( sparqlQuery )) )
    .then( res => res.data )
}

export function findInfoBy( { ncbiId, name }, { limit, lang } = {} ){

  if ( !ncbiId && !name ){
    return Promise.resolve([])
  }

  if ( !name ){
    return findInfoByNcbiId( ncbiId )
  }

  if ( !ncbiId ){
    return findInfoByScientificName( name )
  }

  const sparqlQuery = `SELECT DISTINCT ?item ?itemLabel ?pic ?commonName WHERE {
    { ?item wdt:P685 "${ncbiId}". }
    UNION
    { ?item wdt:P225 "${name}". }
    OPTIONAL { ?item wdt:P18 ?pic. }
    OPTIONAL { ?item wdt:P1843 ?commonName FILTER (lang(?commonName) = '${lang || 'en'}'). }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  }
  LIMIT ${limit || 10}`

  return Promise.resolve( wikidata('sparql?query=' + encodeURIComponent( sparqlQuery )) )
    .then( res => res.data )
}
