import axios from 'axios'
const gbif = axios.create({
  baseURL: 'http://api.gbif.org/v1'
  , timeout: 1000
})

export function searchByCommonName( q ){
  var params = {
    rank: 'SPECIES'
    , qField: 'VERNACULAR'
    , q
  }
  return gbif('/species/search', { params })
    .then( res => {
      var results = res.data.results.map(entry => {
        var vernacularNameList = entry.vernacularNames.filter(n => n.language === 'eng')
        vernacularNameList = vernacularNameList.map( n => n.vernacularName ).join(', ')
        return { ...entry, vernacularNameList }
      })
      return results
    })
}
