<template lang="pug">
.item
  .card.is-shadowless
    .card-header
      LeafViewMenu(:common-name="commonName", :scientific-name="scientificName", :truncate-length="truncateLength")
        b-tooltip(label="See children", type="is-dark")
          b-dropdown(@active-change="getSubtree()")
            a.icon-button.toolbar-control(slot="trigger")
              b-icon(icon="file-tree")
            b-loading(:is-full-page="false", :active="loading")
            b-dropdown-item.heading.has-text-info Children
            hr.dropdown-divider
            b-dropdown-item(v-if="children && children.length", v-for="child in children", :key="child.node_id", @click="$emit('add-node', child)")
              | {{ child.taxon ? child.taxon.name : child.node_id }}
            b-dropdown-item(v-if="!loading && children && !children.length")
              | None
        b-tooltip(label="Remove from tree", type="is-dark")
          a.remove-button.toolbar-control(@click="$emit('remove')")
            b-icon(icon="close-network")
</template>

<script>
import LeafViewMenu from './leaf-view-menu'
import { getLeaf } from '@/lib/taxonomy'
import { getSubtree } from '@/lib/otol'

const DebugModal = {
  props: ['leaf']
  , template: `<div class="box"><pre>{{ JSON.stringify(leaf, null, 2) }}</pre></div>`
}

export default {
  name: 'TOLLeafView'
  , props: ['leaf', 'truncateLength']
  , components: {
    LeafViewMenu
  }
  , data: () => ({
    showImages: false
    , pin: false
    , expanded: false
    , leafData: null
    , txnInfo: null
    , children: null
    , loading: true
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
    commonName(){
      if ( !this.txnInfo ){ return '' }
      return this.txnInfo.vernacularNameList
    }
    , scientificName(){
      if ( !this.txnInfo ){ return '' }
      return this.txnInfo.canonicalName ||
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
    , getSubtree(){
      if ( this.children ){ return }
      this.children = []
      this.loading = true

      if ( !this.leaf ){
        this.active = false
        return
      }

      this.active = true

      getSubtree( this.leaf.node_id ).then( children => {
        this.children = this.children.concat(children)
        this.loading = false
      }).catch( e => console.error(e) )
    }
  }
}
</script>

<style scoped lang="sass">
@import '@/styles/_variables.scss'
.icon-button
  color: $white
  &:hover,
  .dropdown.is-active &
    color: lighten($blue, 10)
.remove-button
  color: $white
  &:hover
    color: lighten($red, 10)
</style>
