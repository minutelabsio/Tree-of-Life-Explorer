<template lang="pug">
.app(:class="{ 'nav-open': navOpen }")
  nav.top-nav.box.is-radiusless.toolbar
    .button.menu-button(@click="menuToggle")
      b-icon(:icon="navOpen ? 'chevron-up' : 'menu'")
    .toolbar-item
      h1.title.main-title.is-pulled-left.clickable(@click="clear")
        | Tree of Life Explorer
    .toolbar-item.search-container
      TOLCommonNameSearch.search-box(@select="onSelect")
    .toolbar-right.top-controls
      b-field(grouped)
        b-field
          .control
            b-tooltip(label="Clear the tree", type="is-dark", position="is-bottom")
              .button.is-primary(@click="clear")
                b-icon(icon="home")
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
          b-dropdown.options-dropdown(:mobile-modal="false")
            .button(slot="trigger")
              span Options
              b-icon(icon="menu-down")
            b-dropdown-item(@click="setOption('fs', !flapStyle)")
              b-icon(:icon="flapStyle ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'")
              span Uncover Images
            b-dropdown-item(@click="setOption('im', !hideImages)")
              b-icon(:icon="hideImages ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'")
              span Hide Images
            b-dropdown-item(@click="setOption('h', !horizontalMode)")
              b-icon(:icon="horizontalMode ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'")
              span Horizontal Tree
            b-dropdown-item(@click="setOption('w', !wideMode)")
              b-icon(:icon="wideMode ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'")
              span Wide Cards

          //- .control
          //-   b-tooltip(:label="wideMode ? 'Smaller cards' : 'Bigger cards'", type="is-dark", position="is-bottom")
          //-     .button(@click="setOption('w', !wideMode)")
          //-       b-icon(:icon="wideMode? 'arrow-collapse-horizontal' : 'arrow-expand-horizontal'")
          //- .control
          //-   b-tooltip(:label="'Change Tree Orientation'", type="is-dark", position="is-bottom")
          //-     .button(@click="setOption('h', !horizontalMode)")
          //-       b-icon(icon="tournament", :custom-class="horizontalMode ? 'icon-anim icon-180' : 'icon-anim icon-270'")
          //- .control
          //-   b-tooltip(:label="hideImages ? 'Show Images' : 'Hide Images'", type="is-dark", position="is-bottom")
          //-     .button(@click="setOption('im', !hideImages)")
          //-       b-icon(:icon="hideImages ? 'image-plus' : 'image-off'")
        b-field
          .control
            b-tooltip(label="Share this tree", type="is-dark", position="is-bottom")
              .button.is-success(@click="share")
                b-icon(icon="share")
          .control
            b-tooltip(label="Take a helpful tour", type="is-dark", position="is-bottom", data-v-tour="start")
              .button.is-dark(@click="startTour", :class="{ pulsing: tourMessage }")
                b-icon(icon="help-network")

      .meta-info
        a(@click="showMetaInfo") About this app

  .below-nav
    .tol-wrapper(v-show="!treeIsEmpty")
      TOLTree(
        :leafs="leafs"
        , :card-width="cardWidth"
        , :hide-images="hideImages"
        , :compactView="compactView"
        , :horizontal="horizontalMode"
        , :flap-style="flapStyle"
        , @remove="onRemoveLeaf"
        , @cut="cutBranch"
        , @add-node="addNode"
        , @error="onError"
      )
    .wrapper
      .inner
        b-loading(:is-full-page="false", :active="loading")
        .empty-state(v-show="treeIsEmpty")
          .suggested
            TOLSuggestedTrees(@suggest="setLeafs")

  .bottom-controls
    b-field
      .control
        b-tooltip(:label="compactView ? 'Normal View' : 'Compact View'", type="is-dark", position="is-left")
          .button.button-compact-view.is-medium(@click="setOption('c', !compactView)")
            b-icon(:icon="compactView ? 'magnify-plus' : 'magnify-minus'")
      .control(v-if="canFullscreen")
        b-tooltip(:label="isInFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'", type="is-dark", position="is-left")
          .button.is-medium(@click="fullscreenToggle")
            b-icon(:icon="isInFullscreen ? 'compress' : 'expand'", pack="fas")
</template>

<script>
import PubSub from '@/lib/pubsub'
import TOLTree from '@/components/tol-tree'
import TOLCommonNameSearch from '@/components/tol-common-name-search'
import TOLSuggestedTrees from '@/components/tol-suggested-trees'
import { getNodeByName } from '@/lib/otol'
// import { findByName } from '@/lib/gbif'
import { getLeaf } from '@/lib/taxonomy'
import { getChildren } from '@/lib/tree-utils'
import { getFullscreenEl, requestFullscreen, exitFullscreen, canFullscreen, fullscreenEventName } from '@/lib/fullscreen'
import { copyToClipboard } from '@/lib/utils'
import _difference from 'lodash/difference'
import _castArray from 'lodash/castArray'
import _uniq from 'lodash/uniq'
import _startsWith from 'lodash/startsWith'
import _filter from 'lodash/filter'
import _union from 'lodash/union'
import _debounce from 'lodash/debounce'
import Promise from 'bluebird'

export default {
  name: 'page-tol'
  , props: {
    'ids': {
      type: Array
      , default: () => []
    }
    , wideMode: {
      type: Boolean
      , default: false
    }
    , horizontalMode: {
      type: Boolean
      , default: true
    }
    , hideImages: {
      type: Boolean
      , default: false
    }
    , compactView: {
      type: Boolean
      , default: false
    }
    , flapStyle: {
      type: Boolean
      , default: false
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
    , navOpen: true
    , loading: false
    , isInFullscreen: false
    , tourMessage: false
  })
  , created(){
    if ( fullscreenEventName ){
      window.addEventListener(fullscreenEventName, () => {
        this.isInFullscreen = !!(getFullscreenEl())
      }, { passive: true })
    }
  }
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
  , mounted(){
    if (this.$el.offsetWidth < 780){
      setTimeout(() => {
        this.navOpen = false
      }, 1000)
    }

    // welcome message
    if ( this.ids && this.ids.length ){ return }
    setTimeout(() => {
      const delay = 10000
      this.tourMessage = true
      this.$snackbar.open({
        message: 'Hi there! If you would like me to show you around, click the tour button highlighted above!'
        , position: 'is-top-right'
        , duration: delay
        , type: 'is-white'
        , actionText: 'go away'
      })
      setTimeout( () => {
        this.tourMessage = false
      }, delay)
    }, 2000)
  }
  , methods: {

    onError( e ){
      console.error( e )
      this.showError( e )
    }

    , showError: _debounce(function( e ){
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
        , queue: false
      })
    }, 100)

    , undo(){
      this.$router.back()
    }

    , redo(){
      this.$router.forward()
    }

    , setLeafs( ids ){
      this.$router.push({ query: { ...this.$route.query, ids: _uniq( ids ) } })
    }

    , addLeaf( ids ){
      ids = _castArray( ids )
      ids = _filter( ids, id => _startsWith(id, 'ott') || _startsWith(id, 'mrca') )
      ids = _union( ids, this.ids )
      this.$router.push({ query: { ...this.$route.query, ids } })
    }

    , removeLeaf( id ){
      this.$router.push({ query: { ...this.$route.query, ids: _difference( this.ids, _castArray(id) ) } })
    }

    , onRemoveLeaf( leaf ){
      this.removeLeaf( leaf.node_id || leaf )
    }

    , onSelect( entry ){
      getNodeByName( entry.scientificName ).then( (node) => {
        this.addLeaf( node.node_id )
      }).catch( e => this.onError( e ) )
    }

    , cutBranch( branch ){
      let children = getChildren( branch )
      this.removeLeaf( children.map( ch => ch.node_id ) )
    }

    , addNode( nodeId ){
      return this.addLeaf( nodeId )
    }

    , onIdsChanged( ids ){
      if ( !ids ){ return }
      Promise.map( ids, getLeaf )
        .then( leafs => (this.leafs = leafs) )
        .catch( e => this.onError( e ) )
        .finally( () => { this.loading = false } )
    }

    , clear(){
      this.$router.push({ query: { ...this.$route.query, ids: [] } })
    }

    , showMetaInfo(){
      this.$root.showMetaInfo = true
    }

    , menuToggle(){
      this.navOpen = !this.navOpen
    }

    , fullscreenToggle(){
      let fs = this.isInFullscreen

      if ( fs ){
        exitFullscreen()
      } else {
        requestFullscreen( document.documentElement )
      }
    }

    , setOption( name, val ){
      this.$router.replace({ query: { ...this.$route.query, [name]: (val | 0) } })
    }

    , share(){
      copyToClipboard( window.location )
      this.$toast.open({
        message: 'URL copied to clipboard!'
        , type: 'is-success'
        , position: 'is-top-right'
      })
    }

    , startTour(){
      PubSub.$emit('tour:start')
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
.bottom-controls
  position: fixed
  bottom: 0
  right: 0
  z-index: 22
  .button
    border-radius: 3px 0 0 0
.below-nav
  position: relative
  flex: 1
  margin-top: $topNavHeight
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
.welcome-msg
  padding: 3rem 1.5rem 0
  .splash-image
    padding: 0 4em

.options-dropdown .dropdown-item
  display: flex
  align-items: center
  flex-direction: row
  .icon
    margin-right: 1ex
@media screen and (max-width: 820px)
  .below-nav
    margin-top: 0
  .tol-wrapper
    top: 0
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
  .tol-wrapper
    top: 0
  .top-nav
    transform: translate3d(0, -172px, 0)
    .toolbar-right
      .meta-info
        position: absolute
        top: 20px
        right: 1.5rem
</style>
