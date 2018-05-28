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

function drawLabel( scene, text, color ){
  return scene.plain( text )
    .style({
      fill: color
      , 'font-size': '20px'
    })
    .attr({
      'text-anchor': 'middle'
      , 'alignment-baseline': 'middle'
    })
    .attr('y', 2)
}

function drawNode( scene, tree, x, y ){
  let nodeRadius = 25
  let group = scene.group().move( x, y )

  if ( tree.lineage.length ){
    group.circle(2 * nodeRadius).center(0, 0).fill('#3988c1')
    drawLabel( group, `${tree.lineage.length}`, 'rgb(202, 217, 246)' )
  }

  if ( tree.node ){
    let spacing = tree.lineage.length ? 70 : 0
    if ( spacing ){
      drawConnection( group, 0, 0, 0, spacing ).back()
    }

    let grp = group.group().move( 0, spacing )
    let name = tree.node.gbifEntry.vernacularNames[0].vernacularName
    grp.rect(12 * name.length, nodeRadius).center(0, 0).fill('#c6b731')
    drawLabel( grp, `${name}`, '#494100' )
  }

  return group
}

function drawConnection( scene, x1, y1, x2, y2 ){
  const spacing = 40
  return scene.polyline([
    [ x1, y1 ]
    , [ x1, y1 + spacing ]
    , [ x2, y1 + spacing ]
    , [ x2, y2 ]
  ]).fill('none').stroke({ width: 1, color: 'rgb(208, 6, 105)' })
}

function drawTree( scene, tree, x = 0, y = 0 ){
  let nodeAreaRadius = 50 * 2.3
  let count = tree.nTips
  let colstart = -(count - 1)
  let branchHeight = 100

  if ( tree.split ){
    tree.split.reduce( (prevcol, subtree) => {
      let col = subtree.nTips - 1
      let xpos = (col + prevcol) * nodeAreaRadius + x
      let ypos = y + branchHeight
      drawConnection( scene, x, y, xpos, ypos )
      drawTree( scene, subtree, xpos, ypos )
      return 2 * col + prevcol + 2
    }, colstart)
  }

  return drawNode( scene, tree, x, y )
}

const Tree = {
  name: 'Tree'
  , inject: ['provider']
  , props: [ 'tree' ]
  , render(){
    if ( !this.provider.svg ){ return }
    if ( !this.tree ){ return }

    this.provider.svg.clear()
    drawTree( this.provider.svg, this.tree, 400, 50 )
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
