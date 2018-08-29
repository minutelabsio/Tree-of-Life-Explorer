<template lang="pug">
.search
  b-field(label="Search by common name", expanded, :message="!searchEntry || results.length || isFetching ? '&nbsp;' : 'Nothing found. Try being more specific'")
    b-field
      b-select(v-model="source")
        option(value="gbif") GBIF Database
        option(value="wikidata") Wikidata.org

      b-autocomplete(
        placeholder="eg. Snow Leopard"
        , icon="magnify"
        , :keep-first="true"
        , :data="results"
        , v-model="searchEntry"
        , :loading="isFetching"
        , @input="search"
        , @select="selectResult"
        , expanded
      )
        template(slot-scope="props")
          .columns
            .common-names.column.is-half.has-text-info {{ props.option.commonNames }}
            .scientific-name.column.is-half {{ props.option.scientificName }}
</template>

<script>
import debounce from 'lodash/debounce'
import { getNodeByName } from '@/lib/otol'
import { searchByCommonName } from '@/lib/gbif'
import { findByCommonName } from '@/lib/wikidata'

export default {
  name: 'TOLCommonNameSearch'
  , props: ['leaves']
  , components: {

  }
  , data: () => ({
    results: []
    , searchEntry: ''
    , source: 'gbif'
    , isFetching: false
  })
  , methods: {
    search: debounce(function( q ) {
      this.results = []
      this.isFetching = true
      let query

      if ( this.source !== 'wikidata' ){
        // gbif search
        query = this.searchGbif( q )
      } else {
        // wikidata search
        query = this.searchWikidata( q )
      }

      query
        .then( results => {
          this.results = results
          this.isFetching = false
        })
        .catch( e => {
          this.errorMsg(e)
        })
    }, 500)

    , searchGbif( q ){
      return searchByCommonName( q )
        .then( results =>
          results.map( el => ({
            commonNames: el.vernacularNameList
            , scientificName: el.canonicalName || el.scientificName
          }))
        )
    }

    , searchWikidata( q ){
      return findByCommonName( q, { limit: 10 } )
        .then( results =>
          results.map( el => ({
            commonNames: el.commonName
            , scientificName: el.scientificName
          }))
        )
    }

    , selectResult( entry ){
      getNodeByName( entry.scientificName )
        .then( () => this.$emit( 'select', entry ) )
        .catch( error => this.errorMsg(error) )
    }

    , errorMsg( error ){
      this.$toast.open({
        duration: 5000
        , message: `Error: ${error.message}`
        , type: 'is-danger'
      })
    }
  }
}
</script>

<style scoped lang="sass">
.common-names, .scientific-names
  white-space: normal
</style>
