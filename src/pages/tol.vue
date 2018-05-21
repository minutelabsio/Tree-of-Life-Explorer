<template lang="pug">
.container.section
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

    .columns
      .column.is-narrow(v-for="entry in selected")
        .box {{ entry.node.lineage.length }} parent nodes
        TOLNodeCard(:gbif-entry="entry.gbifEntry", :node="entry.node")
</template>

<script>
import TOLNodeCard from '@/components/tol-node-card'
import debounce from 'lodash/debounce'
import { searchByCommonName } from '@/lib/gbif'
import { getNodeByName } from '@/lib/otol'

export default {
  name: ''
  , components: {
    TOLNodeCard
  }
  , data: () => ({
    results: []
    , isFetching: false
    , selected: []
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
      getNodeByName( gbifEntry.canonicalName )
        .then( node => {
          this.selected.push({
            gbifEntry
            , node
          })
        })
        .catch( e => {
          console.error(e)
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">

</style>
