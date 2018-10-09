<template lang="pug">
.app(:class="{ 'nav-open': navOpen }")
  nav.top-nav.box.is-radiusless.toolbar
    .button.menu-button(@click="menuToggle")
      b-icon(:icon="navOpen ? 'chevron-up' : 'menu'")
    .toolbar-item
      h1.title.main-title.is-pulled-left
        | Tree of Life Explorer
    .toolbar-item.search-container
      TOLCommonNameSearch.search-box(@select="onSelect")
    .toolbar-right
      b-field(grouped)
        b-field
          .control
            b-tooltip(label="Undo", type="is-dark", position="is-bottom")
              .button(@click="undo")
                b-icon(icon="undo")
          .control
            b-tooltip(label="Redo", type="is-dark", position="is-bottom")
              .button(@click="redo")
                b-icon(icon="redo")
        b-field
          .control
            b-tooltip(:label="wideMode ? 'Smaller cards' : 'Bigger cards'", type="is-dark", position="is-bottom")
              .button(@click="wideMode = !wideMode")
                b-icon(:icon="wideMode? 'arrow-collapse-horizontal' : 'arrow-expand-horizontal'")
          .control
            b-tooltip(:label="horizontalMode ? 'Vertical Display' : 'Horizontal Display'", type="is-dark", position="is-bottom")
              .button(@click="horizontalMode = !horizontalMode")
                b-icon(icon="format-rotate-90")
          .control
            b-tooltip(:label="hideImages ? 'Show Images' : 'Hide Images'", type="is-dark", position="is-bottom")
              .button(@click="hideImages = !hideImages")
                b-icon(:icon="hideImages ? 'image-plus' : 'image-off'")
        b-field
          .control
            b-tooltip(label="Clear All", type="is-dark", position="is-bottom")
              .button.is-danger(@click="clear")
                b-icon(icon="delete-sweep")
      .meta-info
        a(@click="showMetaInfo") About this app

  .tol-wrapper(v-show="!treeIsEmpty")
    TOLTree(
      :leafs="leafs"
      , :card-width="cardWidth"
      , :hide-images="hideImages"
      , :horizontal="horizontalMode"
      , @remove="onRemoveLeaf"
      , @cut="cutBranch"
      , @add-node="addNode"
      , @error="showError"
    )
  .wrapper
    .inner
      b-loading(:is-full-page="false", :active="loading")
      .empty-state(v-show="treeIsEmpty")
        .columns
          .column.is-half.is-offset-one-quarter
            .section
              b-notification(type="is-info", has-icon, :closable="false")
                | Start your own tree by using the search bar to add species, or you can try a curated tree from the below suggestions.
        TOLSuggestedTrees(@suggest="setLeafs")

  .fullscreen-prompt(v-if="canFullscreen")
    b-tooltip(:label="isInFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'", type="is-dark", position="is-left")
      .button.is-medium(@click="fullscreenToggle")
        b-icon(:icon="isInFullscreen ? 'compress' : 'expand'", pack="fas")
</template>

<script>
import TOLTree from '@/components/tol-tree'
import TOLCommonNameSearch from '@/components/tol-common-name-search'
import TOLSuggestedTrees from '@/components/tol-suggested-trees'
import { getNodeByName, getNode } from '@/lib/otol'
// import { findByName } from '@/lib/gbif'
import { getLeaf } from '@/lib/taxonomy'
import { getChildren } from '@/lib/tree-utils'
import { getFullscreenEl, requestFullscreen, exitFullscreen, canFullscreen } from '@/lib/fullscreen'
import _difference from 'lodash/difference'
import _castArray from 'lodash/castArray'
import _uniq from 'lodash/uniq'
import Promise from 'bluebird'

export default {
  name: 'page-tol'
  , props: {
    'ids': {
      type: Array
      , default: () => []
    }
  }
  , components: {
    TOLTree
    , TOLCommonNameSearch
    , TOLSuggestedTrees
  }
  , data: () => ({
    leafs: []
    , canFullscreen
    , wideMode: false
    , horizontalMode: false
    , hideImages: false
    , navOpen: true
    , loading: false
  })
  , computed: {
    cardWidth(){
      return this.wideMode ? 260 : 160
    }
    , treeIsEmpty(){
      return !this.leafs.length
    }
  }
  , watch: {
    ids: {
      handler( ids, oldIds ){
        if ( !oldIds || !oldIds.length ){
          // on first load or tree change... set loading
          this.loading = true
        }
        this.onIdsChanged( this.ids )
      }
      , immediate: true
    }
  }
  , methods: {

    showError( e ){
      var message = ''
      if ( e.message === 'Network Error' ){
        message = 'Trouble connecting with database! Sorry! Things might not work. Try refreshing...'
      } else {
        message = e.message
      }

      this.$toast.open({
        message
        , type: 'is-danger'
        , duration: 10 * 1000
      })

      console.error( e )
    }

    , undo(){
      this.$router.back()
    }

    , redo(){
      this.$router.forward()
    }

    , setLeafs( ids ){
      this.$router.push({ query: { ids: _uniq( ids ) } })
    }

    , addLeaf( id ){
      var ids = [].concat( this.ids )
      ids.push( id )
      this.$router.push({ query: { ids: _uniq( ids ) } })
    }

    , removeLeaf( id ){
      this.$router.push({ query: { ids: _difference( this.ids, _castArray(id) ) } })
    }

    , onRemoveLeaf( leaf ){
      this.removeLeaf( leaf.node_id )
    }

    , onSelect( entry ){
      getNodeByName( entry.scientificName ).then( (node) => {
        this.addLeaf( node.node_id )
      }).catch( e => this.showError( e ) )
    }

    , cutBranch( branch ){
      let children = getChildren( branch )
      this.removeLeaf( children.map( ch => ch.node_id ) )
    }

    , addNode( nodeId ){
      return getNode( nodeId )
        .then( node => {
          this.addLeaf( node.node_id )
        })
    }

    , onIdsChanged( ids ){
      if ( !ids ){ return }
      Promise.map( ids, getLeaf )
        .then( leafs => (this.leafs = leafs) )
        .catch( e => this.showError( e ) )
        .finally( () => { this.loading = false } )
    }

    , clear(){
      this.$router.push({ query: { ids: [] } })
    }

    , showMetaInfo(){
      this.$root.showMetaInfo = true
    }

    , menuToggle(){
      this.navOpen = !this.navOpen
    }

    , isInFullscreen(){
      return !!(getFullscreenEl())
    }

    , fullscreenToggle(){
      let fs = this.isInFullscreen()

      if ( fs ){
        exitFullscreen()
      } else {
        requestFullscreen( document.documentElement )
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
@import '@/styles/_variables.scss'
$topNavHeight: 100px
.main-title
  height: 45px
  width: 166px
//   position: relative
//   font: 0px/0
//   margin: 0
//   margin-right: 1rem
//   font-weight: 700
//   color: $blue
//   text-shadow: 1px 1px 1px lighten($blue, 30)
//
//   padding-left: 2rem
//   // &:before
//   //   content: 'The'
//   //   position: absolute
//   //   top: 3px
//   //   left: 0
//   //   font-size: 1rem
.app
  display: flex
  flex-direction: column
  align-items: stretch
  min-height: 100vh
.fullscreen-prompt
  position: fixed
  bottom: 0
  right: 0
  .button
    border-radius: 3px 0 0 0
.tol-wrapper
  position: fixed
  top: $topNavHeight
  left: 0
  right: 0
  bottom: 0
  z-index: 1
.search-box
.wrapper
  flex: 1
  margin-top: $topNavHeight
  overflow: hidden
  display: flex
  align-items: stretch
  .inner
    position: relative
    flex: 1
  .tree
    min-height: 100%
    margin: auto
.top-nav
  position: fixed
  top: 0
  left: 0
  right: 0
  z-index: 30
  display: flex
  padding: 1rem 1.25rem

  .field
    margin-bottom: 0
  .switch
    height: 100%
  .meta-info
    border-left: 1px solid $grey-lighter
    margin-left: 1rem
    padding-left: 1rem

  .menu-button
    display: none

@media screen and (max-width: 820px)
  .top-nav
    flex-wrap: wrap
    transform: translate3d(0, -120px, 0)
    transition: transform 0.3s ease-in-out
    .nav-open &
      transform: translate3d(0, 0, 0)
    .menu-button
      display: block
      position: absolute
      bottom: -36px
      left: 0
    .toolbar-item
      margin-bottom: 1rem
    .search-container
      display: flex
      justify-content: flex-end
    .toolbar-item,
    .toolbar-right
      display: flex
      flex-direction: row
    .toolbar-right
      width: 100%
      flex-direction: row-reverse
      & > *
        flex: 1
      .meta-info
        border: none
        margin-left: 0
        padding-left: 0
      .field
        justify-content: flex-end
@media screen and (max-width: 420px)
  .top-nav
    transform: translate3d(0, -172px, 0)
    .toolbar-right
      .meta-info
        position: absolute
        top: 20px
        right: 1.5rem
</style>
