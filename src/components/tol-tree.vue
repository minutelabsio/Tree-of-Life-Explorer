<template lang="pug">
.tree(:style="{ height: height + 'px' }", @click="leafContext = null")
  TreeCanvas(@move="onCanvasDrag")
    Tree(
      v-if="tree"
      , :tree="tree"
      , :x="x"
      , :y="topPadding"
      , :width="cardWidth"
      , :padding="padding"
      , :branchHeight="branchHeight"
      , @remove="$emit('remove', arguments[0])"
      , @leaf-click="showLeafDetails"
      , @add-node="$emit('add-node', arguments[0].node_id)"
      , @error="$emit('error', arguments[0])"
      )
  .parent-list.limit-dropdown.dropdown.is-active(v-if="leafContext", :style="{ top: (leafContext.y-100) + 'px', left: (canvasX + leafContext.x + 40) + 'px' }")
    .dropdown-menu
      .dropdown-content
        a.dropdown-item(v-for="parent in leafContext.subtree.lineage", :class="{ 'has-text-grey': !parent.taxon }", @click="$emit('add-node', parent.node_id)") {{ parent | nodeName }}
</template>

<script>
import Tree from '@/components/tree/tree-display'
import TreeCanvas from '@/components/tree/tree-canvas'
import TOLNodeCard from '@/components/tol-node-card'
import { buildReducedTree } from '@/lib/tree-utils'

export default {
  name: 'TOLTree'
  , props: [ 'leafs', 'cardWidth' ]
  , components: {
    Tree
    , TreeCanvas
    , TOLNodeCard
  }
  , data: () => ({
    leafContext: null
    , padding: 10
    , branchHeight: 80
    , topPadding: 60
    , canvasX: 0
  })
  , computed: {
    x(){
      if (!this.tree || !this.$el){ return 0 }
      // let width = this.tree.nTips * (this.cardWidth + 2 * this.padding)
      return 0.5 * this.$el.clientWidth
    }

    , height(){
      if (!this.tree){ return 0 }
      let margin = 1000
      return this.topPadding + this.tree.depth * (2 * this.branchHeight) + margin
    }

    , tree(){
      if (!this.leafs || !this.leafs.length){ return null }
      return buildReducedTree( this.leafs )
    }
  }
  , methods: {
    showLeafDetails( leaf ){
      this.leafContext = leaf
    }
    , onCanvasDrag( pos ){
      this.canvasX = pos.x
    }
  }
}
</script>

<style lang="sass">
@import '@/styles/_variables.scss'
.tree
  position: relative
  width: 100%

  .svg
    cursor: move
</style>
