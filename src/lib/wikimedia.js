// Helpers for https://commons.wikimedia.org
// ---------------------------------------
import Promise from 'bluebird'
import axios from 'axios'
import { setupCache } from 'axios-cache-adapter'
import _values from 'lodash/values'
import _get from 'lodash/get'
import _sortBy from 'lodash/sortBy'
import _mapValues from 'lodash/mapValues'

const SERVER_TIMEOUT = 10 * 1000

const cache = setupCache({
  maxAge: 15 * 60 * 1000
  , key: req => req.url + JSON.stringify(req.params)
  , exclude: {
    query: false
  }
})

const wikimedia = axios.create({
  // baseURL: 'https://commons.wikimedia.org/w'
  baseURL: 'https://species.wikimedia.org/w'
  , timeout: SERVER_TIMEOUT
  , crossdomain: true
  , adapter: cache.adapter
})

function mapImageResults( results ){
  return results.map( (page) => {
    let image = page.imageinfo[0]
    image = _mapValues( image, val => typeof val === 'string' ? val.replace('http:', 'https:') : val )
    return {
      pageid: page.pageid
      , image
    }
  })
}

export function findImagesByName( name, { limit, thumbSize } = {} ){

  var params = {
    'action': 'query'
    , 'prop': 'imageinfo'
    , 'generator': 'search'
    , 'gsrsearch': `File:${name} NOT map NOT atlas NOT lineage NOT svg NOT phylogram NOT cladogram NOT Destroy_this_mad_brute`
    , 'format': 'json'
    , 'origin': '*'
    , 'iiprop': 'url|size'
  }

  if ( thumbSize ){
    params.iiurlwidth = thumbSize
  }

  return Promise.resolve( wikimedia('api.php', { params }) )
    .then( res => res.data )
    .then( data => _values( _get(data, 'query.pages') ) )
    .then( results => results.filter( r => r.title.match(/\.(gif|png|jpe?g|svg)$/) ) )
    .then( results => _sortBy(results, 'index') )
    .then( mapImageResults )
}
