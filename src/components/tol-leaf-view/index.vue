<template lang="pug">
.item(
  @mousedown.stop=""
  , :data-ott="leaf.node_id"
  , :class="{ hovering: hovering, 'flap-style': flapStyle, horizontal: horizontal, vertical: !horizontal }"
)
  .card.is-shadowless(
    v-if="isAddedToTree"
    , @mouseleave.stop.prevent="onMouseLeave"
    , @mouseenter.stop.prevent="onMouseEnter"
    , @click.capture="bufferEvent"
  )
    .card-header.is-shadowless
      b-tooltip.overlay-btn.cut-btn(label="Cut tree here", type="is-dark")
        .btn(@click="$emit('cut', leaf)")
          b-icon(icon="scissors-cutting", size="is-medium")
      b-tooltip.overlay-btn.descendants-btn(label="See descendants", type="is-dark", slot="front-button")
        b-dropdown.limit-dropdown(@active-change="getSubtree()", @wheel.native.stop="", :mobile-modal="false")
          b-icon(icon="file-tree", size="is-medium", slot="trigger")
          b-loading(:is-full-page="false", :active="loading")
          b-dropdown-item.heading.has-text-info Descendants
          b-dropdown-item(v-if="children && children.length")
            b-field
              .control
                .button.is-small(@click="$emit('add-node', children.map(n => n.node_id))")
                  b-icon(icon="expand-all", size="is-small")
                  span Expand All
              .control
                .button.is-small(@click="$emit('remove-node', children.map(n => n.node_id))")
                  b-icon(icon="collapse-all", size="is-small")
                  span Remove All
          hr.dropdown-divider
          b-dropdown-item(
            v-if="children && children.length",
            v-for="child in children",
            :class="{ 'has-text-grey-light': childIsAdded(child) }",
            :key="child.node_id",
            @click="$emit('add-node', child.node_id)"
            )
            | {{ child | nodeName }}
          b-dropdown-item(v-if="!loading && children && !children.length")
            | None
      LeafViewMenu(:common-name="commonName",
        :scientific-name="scientificName",
        :flap-style="flapStyle",
        :short-scientific-name="shortScientificName",
        :truncate-length="commonName ? truncateLength : truncateLength * 2",
        :images="hideImages ? [] : txnImages"
        )
        b-tooltip.overlay-btn(label="More Information", type="is-dark")
          a.toolbar-control(@click="$root.isTouch || hovering && openInfoWindow()", @touchstart.native="hovering && openInfoWindow()")
            b-icon(icon="feature-search", size="is-large")
        b-tooltip.overlay-btn.remove-btn(label="Remove from tree", type="is-dark")
          a.toolbar-control(@click="$root.isTouch || hovering && $emit('remove', leaf.node_id)", @touchstart.native="hovering && $emit('remove', leaf.node_id)")
            b-icon(icon="close-network", size="is-large")
  .minimal(v-if="!isAddedToTree", @click="$emit('add-node', leaf.node_id)")
    .card-title {{ (commonName || shortScientificName) | titleCase }}
    //- .pin-btn
    //-   b-icon(icon="file-plus", size="is-small")
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

function isLowerRank( rank = '' ){
  return [
    'variety'
    , 'species'
    , 'subspecies'
    , 'genus'
    , 'subgenus'
    , 'family'
    , 'subfamily'
    , 'class'
    , 'subclass'
    , 'order'
    , 'superorder'
  ].indexOf(rank) > -1
}

const interactionHideDelay = 2000

export default {
  name: 'TOLLeafView'
  , props: ['leaf', 'truncateLength', 'hideImages', 'flapStyle', 'horizontal']
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
    , hovering: false
  })
  , watch: {
    leaf: {
      handler( leaf ){
        if ( !leaf ){ return }

        getTxnInfo( leaf, { thumbSize: 200 } ).then( info => {
          this.txnInfo = info
          this.otherCommonNames = info.commonName

          // no images for higher ranks
          if ( !isLowerRank(this.txnInfo.rank) ){
            return
          }

          if ( info.thumbnail ){
            let nImages = ['variety', 'species', 'subspecies'].indexOf(this.txnInfo.rank) === -1 ? 2 : 1
            this.txnImages = info.thumbnail.slice(0, nImages)
          } else if ( info.pic ){
            let nImages = ['variety', 'species', 'subspecies'].indexOf(this.txnInfo.rank) === -1 ? 2 : 1
            this.txnImages = info.pic.slice(0, nImages)
          }
        }).catch( ( err ) => this.$emit('error', err) )
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
      if ( !this.$route.query.ids ){ return false }
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
          leaf: this.leaf
          , txnInfo: this.txnInfo
        }
        , hasModalCard: false
      })
    }
    , show(){
      this.hovering = true
    }
    , hide(){
      this.hovering = false
    }
    , startTimer(){
      this.timer = setTimeout(() => this.hide(), interactionHideDelay)
    }
    , clearTimer(){
      clearTimeout( this.timer )
    }
    , onMouseLeave( e ){
      this.startTimer()
    }
    , onMouseEnter( e ){
      setTimeout(() => this.show(), 50)
      this.clearTimer()
    }
    , bufferEvent( e ){
      if ( !this.hovering ){
        e.preventDefault()
        e.stopImmediatePropagation()
        return false
      }
    }
  }
}
</script>

<style scoped lang="sass">
@import '@/styles/_variables.scss'
$greyBlue: desaturate(lighten($blue, 20), 50)

.overlay-btn
  transition: opacity 0.15s ease
  opacity: 0
  .hovering &
    opacity: 1
.cut-btn,
.descendants-btn
  position: absolute
  color: $yellow
  cursor: pointer
  &:active
    color: $blue
.cut-btn
  .icon
    overflow: hidden
    height: 26px
    padding-top: 6px
  .horizontal &
    left: -36px
    top: 9px
  .vertical &
    left: calc(50% - 2px)
    top: -32px
    .icon
      transform: rotate(90deg)
  .vertical.flap-style &
    top: -54px

.descendants-btn
  background: $white
  .horizontal &
    right: -35px
    top: 18px
  .vertical &
    left: calc(50% - 1rem)
    bottom: -2.4em
    padding-top: 4px
  .vertical.flap-style &
    bottom: -56px
.toolbar-control
  color: $grey-lighter
.icon-button
  color: $white
  &:hover,
  .dropdown.is-active &
    color: lighten($blue, 10)
.item .remove-btn
  &:hover
    background: transparentize($red, 0.2)

.minimal
  position: relative
  bottom: 1px
  text-align: center
  // border: 1px solid $greyBlue
  // border-radius: 3px
  // background: $greyBlue
  cursor: pointer

  .vertical &
    bottom: -25px

  .card-title
    display: inline-block
    background: $white
    color: lighten($grey, 12)
    padding: 0 1rem

  // .common-name
  //   padding-right: 24px
  .pin-btn
    position: absolute
    top: 0
    right: 0
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
  &:hover .pin-btn
    border-color: $greyBlue
    background-color: $white
    color: $grey-darker
  &:active .pin-btn
    top: 1px
</style>
