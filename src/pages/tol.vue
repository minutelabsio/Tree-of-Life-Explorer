<template lang="pug">
.container.section
    TOLCommonNameSearch(@select="onSelect")
    TOLTree(:leafs="leafs", @remove="onRemoveLeaf")
</template>

<script>
import TOLTree from '@/components/tol-tree'
import TOLCommonNameSearch from '@/components/tol-common-name-search'
import { getNodeByName } from '@/lib/otol'
import { findByName } from '@/lib/gbif'
import _without from 'lodash/without'
import Promise from 'bluebird'

function Leaf( gbifEntry, node ){
  return {
    gbifEntry
    , node
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
    leafs: []
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
      var names = this.names
      names.push( name )
      this.$router.push({ query: { names } })
    }

    , removeLeaf( name ){
      this.$router.push({ query: { names: _without( this.names, name ) } })
    }

    , onRemoveLeaf( leaf ){
      this.removeLeaf( leaf.gbifEntry.canonicalName )
    }

    , onSelect( gbifEntry ){
      this.addLeaf( gbifEntry.canonicalName )
    }

    , setLeafs( names ){
      if ( !names ){
        return
      }

      Promise.map( names, getLeafData )
        .then( leafs => (this.leafs = leafs) )
        .catch( e => console.error( e ) )
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">

</style>
