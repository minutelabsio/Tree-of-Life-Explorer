<template lang="pug">
.tree
  ChildMenu(:node="subtreeNode", :x="childMenuX", :y="childMenuY", @select="$emit('add-node', arguments[0])")
  //- .lvl(v-for="level in columns")
  //-   .col(v-for="col in level")
  //-     template(v-if="!col")
  //-       .spacer
  //-     .tol-col(v-if="col")
  //-       .box {{ col.tree.lineage.length }}
  //-       TOLNodeCard(
  //-         v-if="col.tree.node"
  //-         , :node="col.tree.node"
  //-       )
  transition-group(name="tree")
    .tol-node(
      v-for="branch in branches"
      , :key="branch.key"
      , :style="{ transform: `translate3d(${branch.x-(0.5 * width)}px, ${branch.y+branch.extend}px, 0)`, width: width + 'px' }"
      )
      Motion(:values="{ x2: branch.x, y2: branch.y, extend: branch.extend }", :spring="{ stiffness: 300, damping: 50, precision: 1 }")
        template(slot-scope="props")
          Connection(:from="[branch.px || props.x2, branch.py || props.y2]", :to="[props.x2, props.y2 + props.extend]")
          Node(v-if="branch.tree.lineage.length", :tree="branch.tree", :x="props.x2", :y="props.y2", @click="$emit('node-click', arguments[0])")

      template(v-if="branch.tree.node")
        TOLNodeItem(
          :node="branch.tree.node"
          , :style="{ width: width + 'px' }"
          , @remove="$emit( 'remove', branch.tree.node )"
          )
      template(v-if="!branch.hasSplit")
        Tail(:node="branch.tree.node", :x="branch.x", :y="branch.y + 160", @click="openChildMenu")
</template>

<script>
import TOLNodeCard from '@/components/tol-node-card'
import TOLNodeItem from '@/components/tol-node-item'
import Node from './node'
import Tail from './tail'
import Connection from './connection'
import ChildMenu from './child-menu'
import _flatten from 'lodash/flatten'

const cardHeight = 80

function getBranches( tree, opts, x = 0, y = 0, level = 0 ){

  let nodeAreaRadius = 0.5 * opts.width + opts.padding
  let count = tree.nTips
  let colstart = -(count - 1)
  let branchHeight = opts.branchHeight
  let branches = []

  branches.push({
    tree
    , x
    , y
    , px: opts.px
    , py: opts.py
    , key: (tree.node ? tree.node.node_id : tree.lineage[0].node_id + '-' + level)
    , extend: tree.node && tree.lineage.length ? 60 : 0
    , isRoot: level === 0
    , hasSplit: !!tree.split
  })

  if (!tree.split){
    return branches
  }

  branches = branches.concat(
    _flatten(
      tree.split.map( (subtree, idx) => {
        let col = subtree.nTips - 1
        let xpos = (col + colstart) * nodeAreaRadius + x
        let ypos = y + branchHeight + (tree.node && tree.split ? cardHeight : 0)

        colstart = 2 * col + colstart + 2

        return getBranches( subtree, {...opts, px: x, py: y}, xpos, ypos, level + 1 )
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
    , key: (tree.node ? tree.node.node_id : tree.lineage[0].node_id + level)
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
    subtreeNode: null
    , childMenuX: 0
    , childMenuY: 0
  })
  , components: {
    Connection
    , ChildMenu
    , Node
    , Tail
    , TOLNodeCard
    , TOLNodeItem
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
  }
  , methods: {
    openChildMenu({ x, y, node }){
      this.childMenuX = x
      this.childMenuY = y
      this.subtreeNode = node
    }
    , onDocumentClick(){
      this.subtreeNode = null
    }
  }
}
</script>

<style lang="scss" scoped>
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
.tol-node {
  position: absolute;
  top: 0;
  left: 0;
  transition: all 0.7s ease-out;

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
</style>
