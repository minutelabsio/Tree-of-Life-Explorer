// Helpers for https://www.marinespecies.org/rest
// ---------------------------------------

import Promise from 'bluebird'
import axios from 'axios'
import { setupCache } from 'axios-cache-adapter'

const cache = setupCache({
  maxAge: 15 * 60 * 1000
})

const worms = axios.create({
  baseURL: 'http://www.marinespecies.org/rest'
  , timeout: 5000
  , crossdomain: true
  , adapter: cache.adapter
})

export function getById( id ){
  return Promise.resolve( worms(`/AphiaRecordByAphiaID/${id}`) ).then( res => res.data )
}
