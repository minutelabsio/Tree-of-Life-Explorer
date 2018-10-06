<template lang="pug">
.tree(:style="{ height: height + 'px' }", @click="openLeafContext = false")
  TreeCanvas(@move="onCanvasDrag", :height="height")
    Tree(
      v-if="tree"
      , :tree="tree"
      , :x="x"
      , :y="y"
      , :width="cardWidth"
      , :cardHeight="cardHeight"
      , :horizontal="horizontal"
      , :padding="padding"
      , :branchSpacing="branchSpacing"
      , @remove="$emit('remove', arguments[0])"
      , @cut="$emit('cut', arguments[0])"
      , @leaf-click="showLeafDetails"
      , @add-node="$emit('add-node', arguments[0].node_id)"
      , @error="$emit('error', arguments[0])"
      )
  .parent-list.limit-dropdown.dropdown.is-active(v-if="openLeafContext", :style="{ top: (leafContextY-100) + 'px', left: (canvasX + leafContextX + 30) + 'px' }")
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
  , props: [ 'leafs', 'cardWidth', 'horizontal' ]
  , components: {
    Tree
    , TreeCanvas
    , TOLNodeCard
  }
  , data: () => ({
    leafContext: null
    , openLeafContext: false
    , leafContextX: 0
    , leafContextY: 0
    , padding: 10
    , topPadding: 60
    , canvasX: 0
    , cardHeight: 74
  })
  , computed: {
    x(){
      if ( !this.tree || !this.$el ){ return 0 }
      if ( this.horizontal ){ return this.topPadding }
      // let width = this.tree.nTips * (this.cardWidth + 2 * this.padding)
      return 0.5 * this.$el.clientWidth
    }

    , y(){
      if ( !this.tree || !this.$el ){ return 0 }
      if ( !this.horizontal ){ return this.topPadding }
      return 0.5 * this.height
    }

    , branchSpacing(){
      return this.horizontal ? 160 : 80
    }

    , height(){
      if (!this.tree){ return 0 }
      if ( this.horizontal ){
        return this.tree.nTips * ( this.cardHeight + 2 * this.padding )
      }
      let margin = 300
      return this.topPadding + this.tree.depth * (100 + this.branchSpacing) + margin
    }

    , tree(){
      if (!this.leafs || !this.leafs.length){ return null }
      return buildReducedTree( this.leafs )
    }
  }
  , methods: {
    showLeafDetails( leaf ){
      let height = leaf.subtree.lineage.length * 30
      this.openLeafContext = true
      this.leafContext = leaf
      this.leafContextX = leaf.x
      this.leafContextY = Math.max(100, leaf.y) + ((height < 100) ? 100 - height * 0.5 : 0)
    }
    , onCanvasDrag( pos ){
      this.canvasX = pos.x
      this.$emit('move', pos)
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
