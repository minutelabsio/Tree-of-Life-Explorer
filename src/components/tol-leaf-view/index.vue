<template lang="pug">
.item
  .card.is-shadowless
    .card-header
      LeafViewMenu(:title='heading')
        b-tooltip(label="See children", type="is-dark")
          a.icon-button.control(@click="$emit('children')")
            b-icon(icon="file-tree")
        b-tooltip(label="Remove from tree", type="is-dark")
          a.remove-button.control(@click="$emit('remove')")
            b-icon(icon="close-network")
</template>

<script>
import LeafViewMenu from './leaf-view-menu'
import { getLeaf } from '@/lib/taxonomy'

const DebugModal = {
  props: ['leaf']
  , template: `<div class="box"><pre>{{ JSON.stringify(leaf, null, 2) }}</pre></div>`
}

export default {
  name: 'TOLLeafView'
  , props: ['leaf']
  , components: {
    LeafViewMenu
  }
  , data: () => ({
    showImages: false
    , pin: false
    , expanded: false
    , leafData: null
    , txnInfo: null
  })
  , watch: {
    leaf: {
      handler( leaf ){
        if ( !leaf ){ return }
        if ( leaf.txnInfo ){
          this.leafData = leaf
          this.txnInfo = leaf.txnInfo
          return
        }

        getLeaf( leaf.node_id ).then( leaf => {
          this.leafData = leaf
          this.txnInfo = leaf.txnInfo
        }).tapCatch( err => this.$snackbar.open({
          message: `Error: ${err.message}`
          , type: 'is-danger'
          , position: 'is-top'
        })).catch( ( err ) => this.$emit('error', err) )
      }
      , immediate: true
    }
  }
  , computed: {
    heading(){
      if ( !this.txnInfo ){ return '' }
      return this.txnInfo.vernacularNameList ||
        this.txnInfo.canonicalName ||
        this.leafData.taxon.name
    }
  }
  , methods: {
    showDebugModal(){
      this.$modal.open({
        parent: this
        , component: DebugModal
        , props: {
          leaf: this.leafData
        }
        , hasModalCard: false
      })
    }
  }
}
</script>

<style scoped lang="sass">
@import '@/styles/_variables.scss'
.item
  max-width: 400px
.icon-button
  color: $white
  &:hover
    color: lighten($blue, 10)
.remove-button
  color: $white
  &:hover
    color: lighten($red, 10)
</style>
