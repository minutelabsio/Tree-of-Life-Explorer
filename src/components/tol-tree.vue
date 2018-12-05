<template lang="pug">
transition(name="tree", appear)
  .tree(@click="openLeafContext = false", v-if="tree")
    TreeCanvas(:width="width", :height="height", :offset-x="0", :offset-y="0", ref="treeCanvas")
      .parent-list.limit-dropdown.dropdown.is-active(
        v-if="openLeafContext"
        , :style="{ top: leafContextY + 'px', left: leafContextX + 'px' }"
        , @wheel.stop=""
        , @touchstart.stop=""
        )
        .dropdown-menu
          .dropdown-content
            .dropdown-item.heading.has-text-info Ancestors
            a.dropdown-item(v-for="parent in leafContext.subtree.lineage", :class="{ 'has-text-grey': !parent.taxon }", @click="$emit('add-node', parent.node_id)") {{ parent | nodeName }}
      Tree(
        :tree="tree"
        , :x="x"
        , :y="y"
        , :compactView="compactView"
        , :cardWidth="cardWidth"
        , :cardHeight="cardHeight"
        , :horizontal="horizontal"
        , :hide-images="hideImages"
        , :padding="padding"
        , :branchSpacing="branchSpacing"
        , :transitions="transitions"
        , :computedBranches.sync="branches"
        , @remove="$emit('remove', arguments[0])"
        , @cut="$emit('cut', arguments[0])"
        , @leaf-click="showLeafDetails"
        , @add-node="$emit('add-node', arguments[0])"
        , @zoom-in="zoomTo(arguments[0].leaf.node_id)"
        , @error="$emit('error', arguments[0])"
        )
</template>

<script>
import PubSub from '@/lib/pubsub'
import Tree from '@/components/tree/tree-display'
import TreeCanvas from '@/components/tree/tree-canvas'
import { buildReducedTree } from '@/lib/tree-utils'
import _differenceBy from 'lodash/differenceBy'
import _find from 'lodash/find'

export default {
  name: 'TOLTree'
  , props: [ 'leafs', 'cardWidth', 'horizontal', 'hideImages', 'compactView' ]
  , components: {
    Tree
    , TreeCanvas
  }
  , data: () => ({
    leafContext: null
    , openLeafContext: false
    , leafContextX: 0
    , leafContextY: 0
    , padding: 10
    , outerPadding: -80
    , canvasX: 0
    , cardHeight: 74
    , transitions: true
    , branches: [] // READ ONLY
  })
  , computed: {
    x(){
      if ( !this.tree || !this.$el ){ return 0 }
      if ( this.horizontal ){ return -0.5 * this.width }
      return 0
    }

    , y(){
      if ( !this.tree || !this.$el ){ return 0 }
      if ( this.horizontal ){ return 0 }
      return -0.5 * this.height
    }

    , branchSpacing(){
      return this.horizontal ? 160 : 80
    }

    , width(){
      if ( !this.tree ){ return 0 }
      if ( !this.horizontal ){
        // vertical display
        return 2 * this.outerPadding + this.tree.nTips * ( this.cardWidth + 2 * this.padding )
      }
      // horizontal display
      return 2 * this.outerPadding + this.tree.depth * (this.cardWidth + this.branchSpacing)
    }

    , height(){
      if ( !this.tree ){ return 0 }
      if ( this.horizontal ){
        // horizontal display
        return 2 * this.outerPadding + this.tree.nTips * ( this.cardHeight + 2 * this.padding )
      }
      // vertical display
      return 2 * this.outerPadding + this.tree.depth * (this.cardHeight + this.branchSpacing)
    }

    , tree(){
      if (!this.leafs || !this.leafs.length){ return null }
      return buildReducedTree( this.leafs )
    }
  }
  , mounted(){
    PubSub.$on('tree:pan-to', (nodeId) => this.$nextTick(() => this.panTo(nodeId)))
  }
  , beforeDestroy(){
    PubSub.$off('tree:pan-to')
  }
  , watch: {
    tree( newVal, oldVal ){
      if ( oldVal === null ){
        this.$nextTick( () => this.centerTree() )
      }
    }
    , horizontal(){
      this.centerTree()
    }
    , leafs( newVal, oldVal ){
      if ( !oldVal || !oldVal.length ){ return }
      let newLeafs = _differenceBy( newVal, oldVal, 'node_id' )
      if ( !newLeafs.length ){ return }
      this.$nextTick(() => {
        this.panTo( newLeafs[0].node_id )
      })
    }
    , compactView(){
      if ( this.compactView ){
        this.centerTree()
      }
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

    , zoomTo( nodeId ){
      this.$router.replace({ query: {...this.$route.query, c: false} })
      this.transitions = false
      this.$nextTick(() => {
        this.panTo( nodeId )
        this.transitions = true
      })
    }

    , panTo( nodeId ){
      let branch = _find(this.branches, { key: nodeId })
      if ( !branch ){ return }
      this.$refs.treeCanvas.panTo( branch.x, branch.y )
    }

    , centerTree(){
      if ( !this.$refs.treeCanvas ){ return }

      let x, y
      let margin = 80

      if ( this.horizontal ){
        x = (this.$el.clientWidth - this.width) * 0.5 - margin
        y = 0
      } else {
        x = 0
        y = (this.$el.clientHeight - this.height) * 0.5 - margin
      }

      this.$refs.treeCanvas.panTo( x, y, false )
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
  opacity: 1
.tree-enter-active, .tree-leave-active
  transition: opacity 0.3s 0.2s linear
.tree-enter, .tree-leave-to
  opacity: 0

.parent-list
  position: absolute
  //- for some reason ios doesn't like z-index
  transform: translateZ(10px)
  z-index: 100
</style>
