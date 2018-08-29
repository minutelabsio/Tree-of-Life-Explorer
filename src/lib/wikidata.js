// Helpers for https://www.marinespecies.org/rest
// ---------------------------------------

import Promise from 'bluebird'
import axios from 'axios'
import { setupCache } from 'axios-cache-adapter'
import _pick from 'lodash/pick'
import _mapValues from 'lodash/mapValues'

const cache = setupCache({
  maxAge: 15 * 60 * 1000
})

const wikidata = axios.create({
  baseURL: 'https://query.wikidata.org'
  , headers: {
    'Accept': 'application/sparql-results+json'
  }
  , timeout: 10000
  , adapter: cache.adapter
})

wikidata.interceptors.response.use(function (response) {
  // Do something with response data
  const { head: { vars }, results } = response.data
  response.data = results.bindings.map( item =>
    _mapValues(_pick(item, vars), 'value')
  )
  return response
}, function (error) {
  // just return
  return Promise.reject(error)
})

export function findByNcbiId( ncbiId, { limit } = {} ){

  const sparqlQuery = `SELECT ?item ?itemLabel ?pic WHERE {
    ?item wdt:P685 "${ncbiId}".
    ?item wdt:P18 ?pic.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  }
  LIMIT ${limit || 10}`

  return Promise.resolve( wikidata('sparql?query=' + encodeURIComponent( sparqlQuery )) )
    .then( res => res.data )
}

export function findByScientificName( name, { limit } = {} ){

  const sparqlQuery = `SELECT ?item ?itemLabel ?pic WHERE {
    ?item wdt:P225 "${name}".
    ?item wdt:P18 ?pic.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  }
  LIMIT ${limit || 10}`

  return Promise.resolve( wikidata('sparql?query=' + encodeURIComponent( sparqlQuery )) )
    .then( res => res.data )
}

export function findByCommonName( q, { limit } = {} ){

  if ( !q ){
    return Promise.resolve([])
  }

  const sparqlQuery = `SELECT DISTINCT ?item ?commonName ?scientificName WHERE {
    ?item wdt:P1843 ?commonName FILTER regex(?commonName, "${q}", "i").
    ?item wdt:P105 wd:Q7432.
    ?item wdt:P225 ?scientificName.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  }
  LIMIT ${limit || 10}`

  return Promise.resolve( wikidata('sparql?query=' + encodeURIComponent( sparqlQuery )) )
    .then( res => res.data )
}

export function findBy( { ncbiId, name }, { limit } = {} ){

  if ( !ncbiId && !name ){
    return Promise.resolve([])
  }

  if ( !name ){
    return findByNcbiId( ncbiId )
  }

  if ( !ncbiId ){
    return findByScientificName( name )
  }

  const sparqlQuery = `SELECT ?item ?itemLabel ?pic WHERE {
    { ?item wdt:P685 "${ncbiId}". }
    UNION
    { ?item wdt:P225 "${name}". }
    ?item wdt:P18 ?pic.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  }
  LIMIT ${limit || 10}`

  return Promise.resolve( wikidata('sparql?query=' + encodeURIComponent( sparqlQuery )) )
    .then( res => res.data )
}
