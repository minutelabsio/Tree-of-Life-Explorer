// Helpers for https://commons.wikimedia.org
// ---------------------------------------

import Promise from 'bluebird'
import axios from 'axios'
import { setupCache } from 'axios-cache-adapter'
import _values from 'lodash/values'
import _get from 'lodash/get'
import _sortBy from 'lodash/sortBy'
import _mapValues from 'lodash/mapValues'

const cache = setupCache({
  maxAge: 15 * 60 * 1000
})

const wikimedia = axios.create({
  baseURL: 'https://commons.wikimedia.org/w'
  , timeout: 10000
  , adapter: cache.adapter
})

function mapImageResults( results ){
  return results.map( (page) => {
    let image = page.imageinfo[0]
    return {
      pageid: page.pageid
      , image
    }
  })
}

export function findImagesByName( name, { limit } = {} ){

  var params = {
    'action': 'query'
    , 'prop': 'imageinfo'
    , 'generator': 'search'
    , 'gsrsearch': `File:${name}`
    , 'format': 'json'
    , 'origin': '*'
    , 'iiprop': 'url'
  }

  return Promise.resolve( wikimedia('api.php', { params }) )
    .then( res => res.data )
    .then( data => _values( _get(data, 'query.pages') ) )
    .then( results => results.filter( r => r.title.match(/\.(gif|png|jpe?g|svg)$/) ) )
    .then( results => _sortBy(results, 'index') )
    .then( mapImageResults )
}
