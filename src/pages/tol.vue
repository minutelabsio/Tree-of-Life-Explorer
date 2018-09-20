<template lang="pug">
.app(:class="{ 'nav-open': navOpen }")
  nav.top-nav.box.is-radiusless.toolbar
    .button.menu-button(@click="menuToggle")
      b-icon(:icon="navOpen ? 'chevron-up' : 'menu'")
    .toolbar-item
      h1.title.main-title.is-pulled-left
        | Tree of Life
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
          b-switch(v-model="wideMode")
            | Wide Mode
        b-field
          .control
            b-tooltip(label="Clear All", type="is-dark", position="is-bottom")
              .button(@click="clear")
                b-icon(icon="delete-sweep")
      .meta-info
        a(@click="showMetaInfo") About this app
  .wrapper
    .inner
      .empty-state(v-show="treeIsEmpty")
        .columns
          .column.is-half.is-offset-one-quarter
            .section
              | The tree is emtpy. Try adding species by typing the name into the search!
      TOLTree(v-show="!treeIsEmpty", :leafs="leafs", :card-width="cardWidth", @remove="onRemoveLeaf", @cut="cutBranch", @add-node="addNode", @error="showError")
</template>

<script>
import TOLTree from '@/components/tol-tree'
import TOLCommonNameSearch from '@/components/tol-common-name-search'
import { getNodeByName, getNode } from '@/lib/otol'
// import { findByName } from '@/lib/gbif'
import { getLeaf } from '@/lib/taxonomy'
import { getChildren } from '@/lib/tree-utils'
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
  }
  , data: () => ({
    leafs: []
    , wideMode: false
    , navOpen: true
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
      handler(){
        this.setLeafs( this.ids )
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

    , setLeafs( ids ){
      if ( !ids ){ return }

      Promise.map( ids, getLeaf )
        .then( leafs => (this.leafs = leafs) )
        .catch( e => this.showError( e ) )
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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
@import '@/styles/_variables.scss'
$topNavHeight: 138px
.main-title
  position: relative
  font-family: 'Mystery Quest', cursive
  margin: 0
  margin-right: 1rem
  font-weight: normal
  color: $blue
  text-shadow: 1px 1px 1px lighten($blue, 30)

  padding-left: 2rem
  &:before
    content: 'The'
    position: absolute
    top: 3px
    left: 0
    font-size: 1rem
.app
  display: flex
  flex-direction: column
  align-items: stretch
  min-height: 100vh
.search-box
.wrapper
  flex: 1
  margin-top: $topNavHeight
  overflow: hidden
  .inner
    position: relative
  .tree
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
