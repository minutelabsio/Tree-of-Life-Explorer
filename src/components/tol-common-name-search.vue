<template lang="pug">
.search(@keyup.esc="closeOverlay")
  .overlay.scrollbars(v-show="overlayOpen", tabindex="-1")
    .inner
      .button.is-outlined.is-large.close(@click="closeOverlay")
        b-icon(icon="backburger", size="is-medium")
      b-field
        b-input(expanded, size="is-large", v-model="searchEntry", ref="overlayInput", icon="magnify", placeholder="eg. Snow Leopard")
        span.clear-btn.delete.is-large(@click="clear")
      .results
        b-loading(:active="isFetching || isFetchingSci", :is-full-page="false")
        .columns
          .column
            aside.menu
              p.menu-label By Common Name...
              ul.menu-list
                li.item(v-for="result in results")
                  a(@click="selectResult( result )")
                    span.tag {{ result.rank || '?' }}
                    span.common-names.has-text-info {{ result.commonNames }}
                    span.scientific-name ({{ result.scientificName }})
          .column
            aside.menu
              p.menu-label By Scientific Name...
              ul.menu-list
                li.item(v-for="result in scientificResults")
                  a(@click="selectResult( result )")
                    span.tag {{ result.rank || '?' }}
                    span.common-names.has-text-info {{ result.scientificName }}
                    span.scientific-name {{ result.commonNames }}
        .empty-results-msg(v-if="searchEntry && !isFetching && !isFetchingSci && !results.length && !scientificResults.length")
          | No results. Is it spelled correctly?
  b-field(expanded)
    b-field
      b-input(type="text", @input="search", @keyup.native="openOverlay", v-model="searchEntry", placeholder="start typing...", icon="magnify")
      .control
        .button(@click="openOverlay")
          span Search
      //- b-autocomplete(
      //-   placeholder="eg. Snow Leopard"
      //-   , icon="magnify"
      //-   , :keep-first="true"
      //-   , :data="results"
      //-   , v-model="searchEntry"
      //-   , :loading="isFetching"
      //-   , @input="search"
      //-   , @select="selectResult"
      //-   , expanded
      //- )
      //-   template(slot-scope="props")
      //-     .columns
      //-       .common-names.column.is-half.has-text-info {{ props.option.commonNames }}
      //-       .scientific-name.column.is-half {{ props.option.scientificName }}
</template>

<script>
import _debounce from 'lodash/debounce'
import _reject from 'lodash/reject'
import _uniqBy from 'lodash/uniqBy'
import cacher from '@/lib/cacher'
import { getNodeByName, getTxResultsByNames } from '@/lib/otol'
import * as gbif from '@/lib/gbif'
import * as wikidata from '@/lib/wikidata'

function filterByOTLMatches( results ){
  return getTxResultsByNames( results.map( el => el.canonicalName || el.scientificName ) )
    .then( otlMatches => otlMatches.map( el => el.name ) )
    .then( otlNames => results.filter( el =>
      otlNames.indexOf(el.canonicalName || el.scientificName) > -1
    ))
}

function removeDuplicates( results ){
  return _uniqBy( results, 'canonicalName' )
}

function removeLackingVernacularName( results ){
  return _reject( results, r => !r.vernacularNameList )
}

export default {
  name: 'TOLCommonNameSearch'
  , props: ['leaves']
  , components: {

  }
  , data: () => ({
    results: []
    , scientificResults: []
    , searchEntry: ''
    , source: 'gbif'
    , isFetching: false
    , isFetchingSci: false

    , overlayOpen: false
  })
  , methods: {
    openOverlay(){
      this.overlayOpen = true
      document.documentElement.style.overflow = 'hidden'
      this.$refs.overlayInput.focus()
    }

    , closeOverlay(){
      this.overlayOpen = false
      document.documentElement.style.overflow = ''
    }

    , search( q ){
      q = q.trim()
      this.results = []
      this.scientificResults = []

      if (!q){ return }

      this.openOverlay()

      this.isFetching = true
      this.isFetchingSci = true
      this.execSearch( q )
    }

    , execSearch: _debounce(function( q ) {
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

      this.searchGbif( q, false )
        .then( results => {
          this.scientificResults = results
          this.isFetchingSci = false
        })
        .catch( e => {
          this.errorMsg(e)
        })
    }, 500)

    , searchGbif: cacher(function( q, commonName = true ){
      let query = commonName
        ? gbif.findByCommonName( q ).then( removeLackingVernacularName )
        : gbif.findByScientificName( q )
      return query
        .then( removeDuplicates )
        .then( filterByOTLMatches )
        .then( results =>
          results.map( el => ({
            commonNames: el.vernacularNameList
            , scientificName: el.canonicalName || el.scientificName
            , rank: el.rank
          }))
        )
    })

    , searchWikidata( q ){
      return wikidata.findInfoByCommonName( q, { limit: 10 } )
        .then( filterByOTLMatches )
        .then( results =>
          results.map( el => ({
            commonNames: el.commonName.join(', ')
            , scientificName: el.scientificName.join(', ')
            , rank: el.rank
          }))
        )
    }

    , selectResult( entry ){
      this.closeOverlay()
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

    , clear(){
      this.searchEntry = ''
    }
  }
}
</script>

<style scoped lang="sass">
.common-names, .scientific-names
  white-space: normal
.overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  height: 100vh
  background: rgba(255,255,255,1)
  z-index: 20
  overflow: auto
  .close
    position: absolute
    top: 25px
    left: 15px
  .inner
    margin: 25px 50px 25px 80px
  .clear-btn
    position: absolute
    top: 36px
    right: 58px
    z-index: 5
.results
  position: relative
  margin-top: 1.5em
  min-height: 300px
  .item
    span
      margin-right: 1ex
      &:last-child
        margin-right: 0

.empty-results-msg
  text-align: center
  margin-top: 4em
</style>
