<script>
function drawLabel( scene, text, color ){
  return scene.plain( text )
    .style({
      'font-size': '20px'
    })
    .attr({
      'text-anchor': 'middle'
      , 'alignment-baseline': 'middle'
    })
    .attr('y', 2)
}

function drawNode( scene, tree, x, y ){
  let nodeRadius = 25
  let group = scene.group().addClass('svg-node').move( x, y ).front()

  if ( tree.lineage.length ){
    group.circle(2 * nodeRadius).center(0, 0)
    drawLabel( group, `${tree.lineage.length}`, 'rgb(202, 217, 246)' )
  }

  // if ( tree.node ){
  //   let spacing = tree.lineage.length ? 70 : 0
  //   if ( spacing ){
  //     drawConnection( group, 0, 0, 0, spacing ).back()
  //   }
  //
  //   let grp = group.group().move( 0, spacing )
  //   let name = tree.node.gbifEntry.vernacularNames[0].vernacularName
  //   grp.rect(12 * name.length, nodeRadius).center(0, 0).fill('#c6b731')
  //   drawLabel( grp, `${name}`, '#494100' )
  // }

  return group
}

export default {
  name: 'Node'
  , inject: [ 'provider' ]
  , props: [ 'tree', 'x', 'y' ]
  , data: () => ({

  })
  , render( h ){
    if ( !this.provider.svg ){ return }
    if ( !this.tree ){ return }
    let scene = this.provider.svg

    if ( this.node ){
      this.node.off( 'click' )
    }

    this.node = drawNode( scene, this.tree, this.x, this.y )
    this.node.on( 'click', () => this.$emit('click', this.tree) )
    return null
  }
}
</script>

<style lang="sass">
.svg-node
  cursor: pointer

  circle
    fill: #fff
    stroke-width: 2
    stroke: #aaa
    transition: all 0.15s linear

  text
    fill: #333
    transition: fill 0.15s linear

  &:hover circle
    fill: #1b7abf
    stroke: #1b7abf

  &:hover text
    fill: #ffffff
</style>
