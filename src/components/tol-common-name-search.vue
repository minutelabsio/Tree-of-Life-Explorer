<template lang="pug">
.search
  b-field(label="Search by common name", :message="!searchEntry || results.length || isFetching ? '&nbsp;' : 'Nothing found. Try being more specific'")
    b-autocomplete(
      placeholder="eg. Snow Leopard"
      , icon="magnify"
      , :keep-first="true"
      , :data="results"
      , v-model="searchEntry"
      , :loading="isFetching"
      , @input="search"
      , @select="selectResult"
    )
      template(slot-scope="props")
        .columns
          .common-names.column.is-half.has-text-info {{ props.option.vernacularNameList }}
          .scientific-name.column.is-half {{ props.option.canonicalName || props.option.scientificName }}
</template>

<script>
import debounce from 'lodash/debounce'
import { getNodeByName } from '@/lib/otol'
import { searchByCommonName } from '@/lib/gbif'

export default {
  name: 'TOLCommonNameSearch'
  , props: ['leaves']
  , components: {

  }
  , data: () => ({
    results: []
    , searchEntry: ''
    , isFetching: false
  })
  , methods: {
    search: debounce(function( q ) {
      this.results = []
      this.isFetching = true
      searchByCommonName( q )
        .then( results => {
          this.results = results
          this.isFetching = false
        })
        .catch( e => {
          this.errorMsg(e)
        })
    }, 500)

    , selectResult( gbifEntry ){
      getNodeByName( gbifEntry.canonicalName )
        .then( () => this.$emit( 'select', gbifEntry ) )
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
