<template lang="pug">
.mrca-item
  .item-title
    span(v-if="loading") ...
    .names(v-if="!loading")
      .common-name {{ commonName | capitalize | truncate(24) }}
      .scientific-name {{ scientificName | capitalize | truncate(24) }}
</template>

<script>
import { getTxnInfo } from '@/lib/taxonomy'

export default {
  name: 'TOLMRCAView'
  , props: ['leaf']
  , components: {

  }
  , data: () => ({
    leafData: null
    , txnInfo: null
    , loading: true
  })
  , watch: {
    leaf: {
      handler( leaf ){
        if ( !leaf ){ return }

        getTxnInfo( leaf ).then( leaf => {
          this.txnInfo = leaf.txnInfo
        }).tapCatch( err =>
          this.$snackbar.open({
            message: `Error: ${err.message}`
            , type: 'is-danger'
            , position: 'is-top'
          })
        ).catch( ( err ) =>
          this.$emit('error', err)
        ).finally( () => (this.loading = false) )
      }
      , immediate: true
    }
  }
  , computed: {
    commonName(){
      if ( !this.txnInfo ){ return '' }
      return this.txnInfo.vernacularNameList
    }
    , scientificName(){
      if ( !this.txnInfo ){ return '' }
      return this.txnInfo.canonicalName ||
        this.leaf.taxon ? this.leaf.taxon.name : this.leaf.node_id
    }
  }
  , methods: {
  }
}
</script>

<style scoped lang="sass">
@import '@/styles/_variables.scss'
.item-title
  text-align: center
  background: $white
.icon-button
  color: $white
  &:hover,
  .dropdown.is-active &
    color: lighten($blue, 10)
</style>
