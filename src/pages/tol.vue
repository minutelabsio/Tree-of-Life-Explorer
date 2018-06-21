<template lang="pug">
.app
  nav.top-nav.box.is-radiusless
    TOLCommonNameSearch.search-box(@select="onSelect")
  .wrapper
    .inner
      TOLTree(:nodes="nodes", @remove="onRemoveLeaf", @add-node="addNode")
</template>

<script>
import TOLTree from '@/components/tol-tree'
import TOLCommonNameSearch from '@/components/tol-common-name-search'
import { getNodeByName, getNode } from '@/lib/otol'
// import { findByName } from '@/lib/gbif'
import { getTaxonomyInfo } from '@/lib/taxonomy'
import _without from 'lodash/without'
import _uniq from 'lodash/uniq'
import Promise from 'bluebird'

function Leaf( node, txn ){
  return {
    ...node
    , txnInfo: txn
  }
}

function getLeafData( id ){
  return getNode( id ).then( node =>
    getTaxonomyInfo( node )
      .then( info => Leaf( node, info ) )
  )
}

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
    nodes: []
  })
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

    , addLeaf( id ){
      var ids = [].concat( this.ids )
      ids.push( id )
      this.$router.push({ query: { ids: _uniq( ids ) } })
    }

    , removeLeaf( id ){
      this.$router.push({ query: { ids: _without( this.ids, id ) } })
    }

    , onRemoveLeaf( leaf ){
      this.removeLeaf( leaf.node_id )
    }

    , onSelect( gbifEntry ){
      getNodeByName( gbifEntry.canonicalName || gbifEntry.scientificName ).then( (node) => {
        this.addLeaf( node.node_id )
      }).catch( e => this.showError( e ) )
    }

    , addNode( nodeId ){
      return getNode( nodeId )
        .then( node => {
          this.addLeaf( node.node_id )
        })
    }

    , setLeafs( ids ){
      if ( !ids ){ return }

      Promise.map( ids, getLeafData )
        .then( nodes => (this.nodes = nodes) )
        .catch( e => this.showError( e ) )
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
.search-box
  width: 420px
.wrapper
  overflow: hidden
  .inner
    position: relative
  .tree
    margin: auto
</style>
