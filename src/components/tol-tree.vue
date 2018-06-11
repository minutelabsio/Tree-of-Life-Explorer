<template lang="pug">
.tree(:style="{ height: height + 'px' }", @click="nodeContext = null")
  TreeCanvas
    Tree(
      v-if="tree"
      , :tree="tree"
      , :x="x"
      , :y="topPadding"
      , :width="cardWidth"
      , :padding="padding"
      , :branchHeight="branchHeight"
      , @remove="$emit('remove', arguments[0])"
      , @node-click="showNodeDetails"
      )
  .dropdown.is-active(v-if="nodeContext", :style="{ top: (nodeContext.y-100) + 'px', left: (nodeContext.x + 40) + 'px' }")
    .dropdown-menu
      .dropdown-content
        a.dropdown-item(v-for="parent in nodeContext.subtree.lineage", :class="{ 'has-text-grey': !parent.taxon }", @click="$emit('add-node', parent.node_id)") {{ parent.taxon ? parent.taxon.name : parent.node_id }}
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

  if ( tree.node ){
    max++
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
    , cardWidth: 260
    , padding: 10
    , branchHeight: 200
    , topPadding: 60
  })
  , computed: {
    x(){
      if (!this.tree || !this.$el){ return 0 }
      // let width = this.tree.nTips * (this.cardWidth + 2 * this.padding)
      return 0.5 * this.$el.clientWidth
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
  position: relative
  width: 100%
</style>
