<template lang="pug">
.item(@mousedown.stop="")
  .card.is-shadowless
    .card-header
      LeafViewMenu(:common-name="commonName",
        :scientific-name="scientificName",
        :short-scientific-name="scientificName | shortName(isMRCA ? 1000 : truncateLength)",
        :truncate-length="commonName ? truncateLength : truncateLength * 2",
        :images="txnImages"
        )
        b-tooltip(label="See children", type="is-dark")
          b-dropdown.limit-dropdown(@active-change="getSubtree()")
            a.icon-button.toolbar-control(slot="trigger")
              b-icon(icon="file-tree")
            b-loading(:is-full-page="false", :active="loading")
            b-dropdown-item.heading.has-text-info Children
            hr.dropdown-divider
            b-dropdown-item(
              v-if="children && children.length",
              v-for="child in children",
              :class="{ 'has-text-grey-light': childIsAdded(child) }"
              :key="child.node_id",
              @click="$emit('add-node', child)"
              )
              | {{ child | nodeName }}
            b-dropdown-item(v-if="!loading && children && !children.length")
              | None
        b-tooltip(label="Remove from tree", type="is-dark")
          a.remove-button.toolbar-control(@click="$emit('remove')")
            b-icon(icon="close-network")
</template>

<script>
import LeafViewMenu from './leaf-view-menu'
import { getTxnInfo, isMRCA } from '@/lib/taxonomy'
import { getSubtree } from '@/lib/otol'

const DebugModal = {
  props: ['leaf']
  , template: `<div class="box"><pre>{{ JSON.stringify(leaf, null, 2) }}</pre></div>`
}

function shortName( str, target ){
  let words = str.split(' ')
  let out = str
  let i = 0
  while ( out.length > target && i < words.length - 1 ){
    let word = words[ i ]
    words[ i ] = `${word[ 0 ]}.`
    out = words.join(' ')
    i++
  }
  return out
}

export default {
  name: 'TOLLeafView'
  , props: ['leaf', 'truncateLength']
  , components: {
    LeafViewMenu
  }
  , filters: {
    shortName
  }
  , data: () => ({
    txnImages: []
    , otherCommonNames: []
    , pin: false
    , expanded: false
    , txnInfo: null
    , children: null
    , loading: true
  })
  , watch: {
    leaf: {
      handler( leaf ){
        if ( !leaf ){ return }

        getTxnInfo( leaf ).then( info => {
          this.txnInfo = info
          this.otherCommonNames = info.commonName
          if ( info.pic ){
            this.txnImages = info.pic
          }
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
      if ( this.isMRCA ){ return '' }
      if ( !this.txnInfo || !this.txnInfo.vernacularNameList ){
        if ( this.otherCommonNames ){
          return this.otherCommonNames[0]
        }
        return ''
      }
      return this.txnInfo.vernacularNameList
    }
    , scientificName(){
      if ( !this.txnInfo ){ return '' }
      return this.txnInfo.canonicalName ||
        this.txnInfo.name ||
        this.leaf.node_id
    }
    , isMRCA(){
      return this.leaf && isMRCA(this.leaf)
    }
  }
  , methods: {
    showDebugModal(){
      this.$modal.open({
        parent: this
        , component: DebugModal
        , props: {
          leaf: this.leaf
        }
        , hasModalCard: false
      })
    }
    , childIsAdded( child ){
      return this.$route.query.ids.indexOf( child.node_id ) > -1
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
