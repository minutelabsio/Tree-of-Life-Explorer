<template lang="pug">
.search
  b-field(label="Search by common name")
    b-autocomplete(
      placeholder="eg. Snow Leopard"
      , :keep-first="true"
      , :data="results"
      , :loading="isFetching"
      , @input="search"
      , @select="selectResult"
    )
      template(slot-scope="props")
        | {{ props.option.scientificName }}
        br/
        small(v-if="props.option.vernacularNameList") ({{ props.option.vernacularNameList }})
</template>

<script>
import debounce from 'lodash/debounce'
import { searchByCommonName } from '@/lib/gbif'

export default {
  name: 'TOLCommonNameSearch'
  , props: ['leaves']
  , components: {

  }
  , data: () => ({
    results: []
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
          console.error(e)
        })
    }, 500)

    , selectResult( gbifEntry ){
      this.$emit( 'select', gbifEntry )
    }
  }
}
</script>

<style scoped lang="sass">

</style>
