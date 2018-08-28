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
  , timeout: 5000
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

export function findByNcbiId( ncbiId ){

  const sparqlQuery = `SELECT ?item ?itemLabel ?pic WHERE {
    ?item wdt:P685 "${ncbiId}".
    ?item wdt:P18 ?pic.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  }
  LIMIT 10`

  return Promise.resolve( wikidata('sparql?query=' + encodeURIComponent( sparqlQuery )) )
    .then( res => res.data )
}
