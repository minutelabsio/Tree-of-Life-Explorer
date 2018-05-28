<template lang="pug">
.container.section
    TOLCommonNameSearch(@select="onSelect")
    .wrapper
      .inner
        TOLTree(:nodes="nodes", @remove="onRemoveLeaf")
</template>

<script>
import TOLTree from '@/components/tol-tree'
import TOLCommonNameSearch from '@/components/tol-common-name-search'
import { getNodeByName } from '@/lib/otol'
import { findByName } from '@/lib/gbif'
import _without from 'lodash/without'
import Promise from 'bluebird'

function Leaf( gbifEntry, otNode ){
  return {
    gbifEntry
    , otNode
  }
}

function getLeafData( name ){
  return Promise.join(
    getNodeByName( name )
    , findByName( name )
    , function( otResult, gbifResults ){
      return Leaf( gbifResults[0], otResult )
    }
  )
}

export default {
  name: 'page-tol'
  , props: {
    'names': {
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
    names: {
      handler(){
        this.setLeafs( this.names )
      }
      , immediate: true
    }
  }
  , methods: {
    addLeaf( name ){
      var names = [].concat(this.names)
      names.push( name )
      this.$router.push({ query: { names } })
    }

    , removeLeaf( name ){
      this.$router.push({ query: { names: _without( this.names, name ) } })
    }

    , onRemoveLeaf( node ){
      this.removeLeaf( node.gbifEntry.canonicalName )
    }

    , onSelect( gbifEntry ){
      this.addLeaf( gbifEntry.canonicalName )
    }

    , setLeafs( names ){
      if ( !names ){
        return
      }

      Promise.map( names, getLeafData )
        .then( nodes => (this.nodes = nodes) )
        .catch( e => console.error( e ) )
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
.wrapper
  overflow: hidden
  .inner
    position: relative
  .tree
    margin: auto
</style>
