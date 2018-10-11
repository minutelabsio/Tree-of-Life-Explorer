<template lang="pug">
.tree(@click="openLeafContext = false")
  TreeCanvas(:width="width", :height="height", :offset-x="x", :offset-y="y")
    .parent-list.limit-dropdown.dropdown.is-active(
      v-if="openLeafContext"
      , :style="{ top: leafContextY + 'px', left: leafContextX + 'px' }"
      , @wheel.stop=""
      , @touchstart.stop=""
      )
      .dropdown-menu
        .dropdown-content
          a.dropdown-item(v-for="parent in leafContext.subtree.lineage", :class="{ 'has-text-grey': !parent.taxon }", @click="$emit('add-node', parent.node_id)") {{ parent | nodeName }}
    Tree(
      v-if="tree"
      , :tree="tree"
      , :x="0"
      , :y="0"
      , :cardWidth="cardWidth"
      , :cardHeight="cardHeight"
      , :horizontal="horizontal"
      , :hide-images="hideImages"
      , :padding="padding"
      , :branchSpacing="branchSpacing"
      , @remove="$emit('remove', arguments[0])"
      , @cut="$emit('cut', arguments[0])"
      , @leaf-click="showLeafDetails"
      , @add-node="$emit('add-node', arguments[0].node_id)"
      , @error="$emit('error', arguments[0])"
      )
</template>

<script>
import Tree from '@/components/tree/tree-display'
import TreeCanvas from '@/components/tree/tree-canvas'
import TOLNodeCard from '@/components/tol-node-card'
import { buildReducedTree } from '@/lib/tree-utils'

export default {
  name: 'TOLTree'
  , props: [ 'leafs', 'cardWidth', 'horizontal', 'hideImages' ]
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
      if ( this.horizontal ){ return -this.width * 0.5 + this.topPadding }
      // let width = this.tree.nTips * (this.cardWidth + 2 * this.padding)
      return 0.5 * this.$el.clientWidth
    }

    , y(){
      if ( !this.tree || !this.$el ){ return 0 }
      if ( !this.horizontal ){ return this.topPadding }
      return 0.5 * this.height + this.topPadding
    }

    , branchSpacing(){
      return this.horizontal ? 160 : 80
    }

    , width(){
      if ( !this.tree ){ return 0 }
      if ( !this.horizontal ){
        // vertical display
        return this.tree.nTips * ( this.cardWidth + 2 * this.padding )
      }
      let margin = 0
      // horizontal display
      return this.topPadding + this.tree.depth * (this.cardWidth + this.branchSpacing) + margin
    }

    , height(){
      if ( !this.tree ){ return 0 }
      if ( this.horizontal ){
        // horizontal display
        return this.tree.nTips * ( this.cardHeight + 2 * this.padding )
      }
      let margin = 0
      // vertical display
      return this.topPadding + this.tree.depth * (this.cardHeight + this.branchSpacing) + margin
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
      this.leafContextX = leaf.x + 30
      this.leafContextY = leaf.y - 50 + Math.max(0, 50 - height)
    }
  }
}
</script>

<style lang="sass" scoped>
@import '@/styles/_variables.scss'
.tree
  position: relative
  width: 100%
  height: 100%
  z-index: 1
.parent-list
  position: absolute
  //- for some reason ios doesn't like z-index
  transform: translateZ(10px)
  z-index: 100
</style>
