<template lang="pug">
.tree
  #bg(ref="svg")
    Tree(:tree="tree")
  #fg
    .columns
      .column.is-narrow(v-for="node in nodes")
        .box {{ node.otNode.lineage.length }} parents
        TOLNodeCard(:gbif-entry="node.gbifEntry", :node="node.otNode", @close="$emit( 'remove', node )")
</template>

<script>
import TOLNodeCard from '@/components/tol-node-card'
import { buildReducedTree } from '@/lib/tree-utils'
import SVG from 'svg.js'

function drawTree( scene, tree, x = 0, y = 0 ){
  let node = scene.group().center(-25, -25).move( x, y )
  node.circle(50).fill('#3988c1')
  node.text(`${tree.lineage.length}`)
    .style({
      fill: 'rgb(202, 217, 246)'
      , 'font-size': '20px'
    })
    .attr({
      'text-anchor': 'middle'
    })
    .move( 25, 13 )
}

const Tree = {
  name: 'Tree'
  , inject: ['provider']
  , props: [ 'tree' ]
  , render(){
    if ( !this.provider.svg ){ return }
    if ( !this.tree ){ return }

    drawTree( this.provider.svg, this.tree, 200, 50 )
  }
}

export default {
  name: 'TOLTree'
  , props: [ 'nodes' ]
  , components: {
    Tree
    , TOLNodeCard
  }
  , data: () => ({
    provider: {
      svg: null
    }
    , tree: null
  })
  , provide(){
    return {
      provider: this.provider
    }
  }
  , mounted(){
    this.provider.svg = SVG(this.$refs['svg']).size('100%', '100%')
    if ( this.nodes ){
      this.buildTree( this.nodes )
    }
  }
  , watch: {
    nodes: {
      handler(){
        this.buildTree( this.nodes )
      }
    }
  }
  , methods: {
    buildTree( nodes ){
      if ( !nodes || !nodes.length ){ return }
      var tree = buildReducedTree( nodes )
      this.tree = tree
    }
  }
}
</script>

<style scoped lang="sass">
.tree
  position: relative;
  height: 100%;
  width: 100%;
#bg, #fg
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
#fg
  display: none;
  z-index: 1;
</style>
