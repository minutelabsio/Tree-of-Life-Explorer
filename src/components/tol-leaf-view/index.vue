<template lang="pug">
.item(@mousedown.stop="")
  .card.is-shadowless(v-if="isAddedToTree")
    .card-header
      LeafViewMenu(:common-name="commonName",
        :scientific-name="scientificName",
        :short-scientific-name="shortScientificName",
        :truncate-length="commonName ? truncateLength : truncateLength * 2",
        :images="txnImages",
        @click="openInfoWindow"
        )
        b-tooltip(label="See children", type="is-dark", slot="front-button")
          b-dropdown.limit-dropdown(@active-change="getSubtree()")
            b-icon.front-icon(icon="file-tree", slot="trigger")
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
        b-tooltip(label="Cut tree here", type="is-dark")
          a.cut-button.toolbar-control(@click="$emit('cut', leaf)")
            b-icon(icon="content-cut")
  .minimal(v-if="!isAddedToTree")
    .common-name {{ (commonName || shortScientificName) | titleCase }}
    .pin-btn(@click="$emit('add-node', leaf)")
      b-icon(icon="file-plus", size="is-small")
</template>

<script>
import LeafViewMenu from './leaf-view-menu'
import { getTxnInfo, isMRCA } from '@/lib/taxonomy'
import { getSubtree } from '@/lib/otol'
import TaxonomyInfoWindow from '@/components/taxonomy-info-window'

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

        getTxnInfo( leaf, { thumbSize: 200 } ).then( info => {
          this.txnInfo = info
          this.otherCommonNames = info.commonName
          if ( info.thumbnail ){
            let nImages = ['species', 'subspecies'].indexOf(this.txnInfo.rank) === -1 ? 5 : 1
            this.txnImages = info.thumbnail.splice(0, nImages)
          } else if ( info.pic ){
            let nImages = ['species', 'subspecies'].indexOf(this.txnInfo.rank) === -1 ? 5 : 1
            this.txnImages = info.pic.splice(0, nImages)
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
    , shortScientificName(){
      return shortName(this.scientificName, this.isMRCA ? 1000 : this.truncateLength)
    }
    , scientificName(){
      if ( !this.txnInfo ){ return '' }
      return this.txnInfo.canonicalName ||
        this.txnInfo.name ||
        this.leaf.node_id || ''
    }
    , isMRCA(){
      return this.leaf && isMRCA(this.leaf)
    }
    , isAddedToTree(){
      return this.childIsAdded( this.leaf )
    }
  }
  , methods: {
    childIsAdded( child ){
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
    , openInfoWindow(){
      this.$modal.open({
        parent: this
        , component: TaxonomyInfoWindow
        , props: {
          txnInfo: this.txnInfo
        }
        , hasModalCard: false
      })
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
.remove-button,
.cut-button
  color: $white
  &:hover
    color: lighten($red, 10)
.front-icon
  color: darken($blue, 30)
  text-shadow: 0.5px 0.5px 1px lighten($blue, 20)

$greyBlue: desaturate(lighten($blue, 20), 50)
.minimal
  position: relative
  text-align: center
  border: 1px solid $greyBlue
  border-radius: 3px
  background: $greyBlue
  color: $white
  .pin-btn
    position: absolute
    top: -14px
    right: -12px
    width: 24px
    height: 24px
    text-align: center
    background: $greyBlue
    color: $white
    border: 1px solid $white
    border-radius: 50%
    line-height: 24px
    padding-left: 1px
    cursor: pointer
    &:hover
      border-color: $greyBlue
      background-color: $white
      color: $grey-darker
    &:active
      top: -13px
</style>
