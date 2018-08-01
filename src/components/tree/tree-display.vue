<template lang="pug">
.tree
  //- ChildMenu(:leaf="subtreeLeaf", :x="childMenuX", :y="childMenuY", @select="$emit('add-node', arguments[0])")
  //- .lvl(v-for="level in columns")
  //-   .col(v-for="col in level")
  //-     template(v-if="!col")
  //-       .spacer
  //-     .tol-col(v-if="col")
  //-       .box {{ col.tree.lineage.length }}
  //-       TOLNodeCard(
  //-         v-if="col.tree.leaf"
  //-         , :leaf="col.tree.leaf"
  //-       )
  transition-group(name="tree")
    .tol-leaf(
      v-for="branch in branches"
      , :key="branch.key"
      , :style="{ transform: `translate3d(${branch.x-(0.5 * width)}px, ${branch.y + branch.dy}px, 0)`, width: width + 'px' }"
      )
      //- Motion(:values="{ x2: branch.x, y2: branch.y, dy: branch.dy }", :spring="{ stiffness: 300, damping: 60, precision: 1 }")
      //-   template(slot-scope="props")
      Connection(:x1="branch.px || branch.x", :y1="(branch.py || branch.y) + branch.pdy", :x2="branch.x", :y2="branch.y + branch.dy", :padding="branch.dy")
      Node(v-if="branch.tree.lineage.length", :tree="branch.tree", :x="branch.x", :y="branch.y", @click="$emit('leaf-click', arguments[0])")

      template(v-if="branch.tree.leaf && branch.tree.leaf.txnInfo")
        TOLLeafView(
          :leaf="branch.tree.leaf"
          , :truncate-length="truncateLength"
          , @remove="$emit( 'remove', branch.tree.leaf )"
          , @error="$emit( 'error', arguments[0] )"
          , @add-node="$emit( 'add-node', arguments[0] )"
          )
      template(v-if="branch.tree.leaf && !branch.tree.leaf.txnInfo")
        TOLMRCAView(:leaf="branch.tree.leaf")
        //- .simple.has-text-centered {{ branch.tree.leaf.node_id }}
      //- template(v-if="!branch.hasSplit")
      //-   Tail(:leaf="branch.tree.leaf", :x="branch.x", :y="branch.y + 160", @click="openChildMenu")
</template>

<script>
import TOLNodeCard from '@/components/tol-node-card'
import TOLLeafView from '@/components/tol-leaf-view'
import TOLMRCAView from '@/components/tol-mrca-view'
import Node from './node'
import Tail from './tail'
import Connection from './connection'
import ChildMenu from './child-menu'
import _flatten from 'lodash/flatten'

const cardHeight = 50

function getBranches( tree, opts, x = 0, y = 0, level = 0 ){

  let nodeAreaRadius = 0.5 * opts.width + opts.padding
  let count = tree.nTips
  let colstart = -(count - 1)
  let branchHeight = opts.branchHeight
  let branches = []
  let height = tree.lineage.length ? cardHeight : 0

  branches.push({
    tree
    , x
    , y
    , px: opts.px
    , py: opts.py
    , pdy: opts.pdy || 0
    , key: (tree.leaf.node_id || tree.leaf)
    , dy: height
    , isRoot: level === 0
    , hasSplit: !!tree.split.length
  })

  if ( !tree.split.length ){
    return branches
  }

  branches = branches.concat(
    _flatten(
      tree.split.map( (subtree, idx) => {
        let col = subtree.nTips - 1
        let xpos = (col + colstart) * nodeAreaRadius + x
        let ypos = y + branchHeight + height + cardHeight

        colstart = 2 * col + colstart + 2

        return getBranches( subtree, {...opts, px: x, py: y, pdy: height}, xpos, ypos, level + 1 )
      })
    )
  )

  return branches
}

function appendToColumns( tree, columns, colOffset = 0, level = 0 ){
  let colIndex = colOffset + tree.nTips - 1
  let row = columns[ level ]
  row[ colIndex ] = {
    tree
    , key: (tree.leaf ? tree.leaf.node_id : tree.lineage[0].node_id + level)
    , isRoot: level === 0
    , hasSplit: !!tree.split
  }

  if ( !tree.split ){
    return columns
  }

  tree.split.forEach( (subtree, idx) => {
    appendToColumns( subtree, columns, colOffset, level + 1 )
    colOffset += subtree.nTips * 2
  })

  return columns
}

function getColumns( tree ){
  // const nCols = tree.nTips * 2 - 1
  const columns = Array( tree.depth ).fill(0).map(a => [])
  appendToColumns( tree, columns )
  return columns
}

export default {
  name: 'Tree'
  , props: {
    'tree': Object
    , 'x': Number
    , 'y': Number
    , 'px': Number
    , 'py': Number
    , 'width': Number
    , 'padding': Number
    , 'branchHeight': Number
  }
  , data: () => ({
    subtreeLeaf: null
    , childMenuX: 0
    , childMenuY: 0
  })
  , components: {
    Connection
    , ChildMenu
    , Node
    , Tail
    , TOLNodeCard
    , TOLLeafView
    , TOLMRCAView
  }
  , created () {
    document.addEventListener('click', this.onDocumentClick)
  }
  , destroyed () {
    // important to clean up!!
    document.removeEventListener('click', this.onDocumentClick)
  }
  , computed: {
    branches(){
      let tree = this.tree
      let b = getBranches(tree, {
        width: this.width
        , branchHeight: this.branchHeight
        , padding: this.padding
      }, this.x, this.y)
      return b
    }

    , columns(){
      let tree = this.tree
      let cols = getColumns( tree )
      return cols
    }

    , truncateLength(){
      return this.width / 14 | 0
    }
  }
  , methods: {
    openChildMenu({ x, y, leaf }){
      this.childMenuX = x
      this.childMenuY = y
      this.subtreeLeaf = leaf
    }
    , onDocumentClick(){
      this.subtreeLeaf = null
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';
.child-menu {
  position: absolute;
  top: 0;
  left: 0;
  .dropdown-menu {
    position: relative;
    top: 20px;
    left: -50%;
  }
}
.lvl {
  display: flex;
  align-items: flex-start;
  .col {
    display: block;
    margin: 0 -60px;
    width: 260px;

    &:first-child {
      margin-left: 0;
    }

    &:last-child {
      margin-right: 0;
    }
  }

  .spacer {
    height: 100px;
  }
}
.tol-leaf {
  position: absolute;
  top: 0;
  left: 0;
  transition: all 0.7s ease-in-out;

  &:hover,
  &:active,
  &:focus {
    z-index: 1;
  }

  .card {
    position: absolute;
    top: 0;
    left: 0;
  }
}
.tree-enter-active, .tree-leave-active {

}
.tree-enter, .tree-leave-to {
  opacity: 0;
  top: -80px;
}
.simple {
  background: $white;
}
</style>
