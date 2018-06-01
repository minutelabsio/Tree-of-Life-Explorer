<template lang="pug">
.tree(:style="{ width: (2 * x) + 'px', height: height + 'px' }", @click="nodeContext = null")
  TreeCanvas
    Tree(
      v-if="tree"
      , :tree="tree"
      , :x="x"
      , :y="topPadding"
      , :width="width"
      , :padding="padding"
      , :branchHeight="branchHeight"
      , @remove="$emit('remove', arguments[0])"
      , @node-click="showNodeDetails"
      )
  .dropdown.is-active(v-if="nodeContext", :style="{ top: nodeContext.y + 'px', left: nodeContext.x + 'px' }")
    .dropdown-menu
      .dropdown-content
        a.dropdown-item(v-for="parent in nodeContext.subtree.lineage", :class="{ 'has-text-grey': !parent.taxon }") {{ parent.taxon ? parent.taxon.name : parent.node_id }}
</template>

<script>
import Tree from '@/components/tree/tree-display'
import TreeCanvas from '@/components/tree/tree-canvas'
import TOLNodeCard from '@/components/tol-node-card'
import { buildReducedTree } from '@/lib/tree-utils'

function maxDepth( tree, max = 0 ){
  if ( !tree.split ){
    return max + 1
  }

  return tree.split.reduce( (max, tree) => Math.max(max, maxDepth(tree, max)), max )
}

export default {
  name: 'TOLTree'
  , props: [ 'nodes' ]
  , components: {
    Tree
    , TreeCanvas
    , TOLNodeCard
  }
  , data: () => ({
    nodeContext: null
    , width: 260
    , padding: 10
    , branchHeight: 200
    , topPadding: 60
  })
  , computed: {
    x(){
      if (!this.tree){ return 0 }
      return this.tree.nTips * (this.width + 2 * this.padding) / 2
    }

    , height(){
      if (!this.tree){ return 0 }
      let fudge = 400
      return this.topPadding + maxDepth(this.tree) * this.branchHeight + fudge
    }

    , tree(){
      if (!this.nodes || !this.nodes.length){ return null }
      return buildReducedTree( this.nodes )
    }
  }
  , methods: {
    showNodeDetails( node ){
      this.nodeContext = node
    }
  }
}
</script>

<style scoped lang="sass">
.tree
  position: relative;
</style>
