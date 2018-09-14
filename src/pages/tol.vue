<template lang="pug">
.app
  nav.top-nav.box.is-radiusless.toolbar
    .toolbar-item
      TOLCommonNameSearch.search-box(@select="onSelect")
    .toolbar-right
      b-field(grouped)
        b-field
          .control
            b-tooltip(label="undo", type="is-dark", position="is-bottom")
              .button(@click="undo")
                b-icon(icon="undo")
          .control
            b-tooltip(label="redo", type="is-dark", position="is-bottom")
              .button(@click="redo")
                b-icon(icon="redo")
        b-field
          b-switch(v-model="wideMode")
            | Wide Mode
  .wrapper
    .inner
      TOLTree(:leafs="leafs", :card-width="cardWidth", @remove="onRemoveLeaf", @cut="cutBranch", @add-node="addNode", @error="showError")
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
  })
  , computed: {
    cardWidth(){
      return this.wideMode ? 260 : 160
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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
$topNavHeight: 138px
.app
  display: flex
  flex-direction: column
  align-items: stretch
  min-height: 100vh
.search-box
  width: 620px
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
  z-index: 40
  display: flex
</style>
