<template lang="pug">
.tol-node(v-if="tree", :style="{ 'left': (x-px) + 'px', 'top': (y-py) + 'px', width: width + 'px' }")
  template(v-if="tree.node")
    Connection(v-if="entryPadding", :from="[x, y]", :to="[x, y + entryPadding]")
    TOLNodeCard(
      :gbif-entry="tree.node.gbifEntry"
      , :node="tree.node.otNode"
      , :style="{ 'top': entryPadding + 'px', right: (0.5 * width) + 'px', width: width + 'px' }"
      , @close="$emit( 'remove', tree.node )"
      )
  template(v-for="branch in branches")
    Connection(:from="[x, y]", :to="[branch.x, branch.y]")
    Tree(
      :tree="branch.tree"
      , :x="branch.x"
      , :y="branch.y"
      , :px="x"
      , :py="y"
      , :width="width"
      , :padding="padding"
      , :branchHeight="branchHeight"
      , @remove="$emit('remove', arguments[0])"
      , @node-click="$emit('node-click', arguments[0])"
      )
  Node(:tree="tree", :x="x", :y="y", @click="$emit('node-click', arguments[0])")
</template>

<script>
import TOLNodeCard from '@/components/tol-node-card'
import Node from './node'
import Connection from './connection'

export default {
  name: 'Tree'
  , props: {
    'tree': Object
    , 'x': Number
    , 'y': Number
    , 'px': {
      type: Number
      , default: 0
    }
    , 'py': {
      type: Number
      , default: 0
    }
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

    entryPadding(){
      return this.tree.lineage.length ? 60 : 0
    }

    , branches(){
      let tree = this.tree
      let x = this.x
      let y = this.y

      let nodeAreaRadius = 0.5 * this.width + this.padding
      let count = tree.nTips
      let colstart = -(count - 1)
      let branchHeight = this.branchHeight

      if ( !tree.split ){
        return []
      }

      return tree.split.map( (subtree, idx) => {
        let col = subtree.nTips - 1
        let xpos = (col + colstart) * nodeAreaRadius + x
        let ypos = y + branchHeight

        colstart = 2 * col + colstart + 2

        return {
          idx
          , tree: subtree
          , x: xpos
          , y: ypos
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.tol-node {
  position: absolute;

  .card {
    position: absolute;
  }
}
</style>
