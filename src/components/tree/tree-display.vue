<template lang="pug">
.tree
  transition-group(name="tree", appear)
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
        TOLNodeCard(
          :node="branch.tree.node"
          , :style="{ width: width + 'px' }"
          , @close="$emit( 'remove', branch.tree.node )"
          )
</template>

<script>
import TOLNodeCard from '@/components/tol-node-card'
import Node from './node'
import Connection from './connection'
import _flatten from 'lodash/flatten'

const cardHeight = 200

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
    , key: (tree.node ? tree.node.node_id : tree.lineage[0].node_id) + level
    , extend: tree.node && tree.lineage.length ? 60 : 0
    , isRoot: level === 0
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
  })
  , components: {
    Connection
    , Node
    , TOLNodeCard
  }
  , computed: {
    branches(){
      let tree = this.tree
      let b = getBranches(tree, {
        width: this.width
        , branchHeight: this.branchHeight
        , padding: this.padding
      }, this.x, this.y)
      console.log(tree, b)
      return b
    }
  }
}
</script>

<style lang="scss" scoped>
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
  top: 100vh
}
</style>
