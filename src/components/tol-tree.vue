<template lang="pug">
.columns
  .column.is-narrow(v-for="node in nodes")
    .box {{ node.otNode.lineage.length }} parents
    TOLNodeCard(:gbif-entry="node.gbifEntry", :node="node.otNode", @close="$emit( 'remove', node )")
</template>

<script>
import TOLNodeCard from '@/components/tol-node-card'
import { buildReducedTree } from '@/lib/tree-utils'

export default {
  name: 'TOLTree'
  , props: [ 'nodes' ]
  , components: {
    TOLNodeCard
  }
  , data: () => ({

  })
  , watch: {
    nodes: {
      handler(){
        this.buildTree( this.nodes )
      }
    }
  }
  , methods: {
    buildTree( nodes ){
      var tree = buildReducedTree( nodes )
      console.log(tree)
    }
  }
}
</script>

<style scoped lang="sass">

</style>
