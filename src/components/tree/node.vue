<script>
export default {
  name: 'Node'
  // , functional: true
  , inject: [ 'svg' ]
  , props: [ 'tree', 'x', 'y' ]
  , data: () => ({

  })
  , beforeDestroy(){
    this.node.off( 'click' )
    this.node.remove()
  }
  , beforeMount(){
    let nodeRadius = 25
    let scene = this.svg
    this.node = scene.group().addClass('svg-node').move( this.x, this.y )
    this.node.circle(2 * nodeRadius).center(0, 0)

    this.label = this.node.plain( `${this.tree.lineage.length}` ).attr('y', 2)

    this.node.on( 'click', (e) => {
      e.stopPropagation()
      this.$emit( 'click', { subtree: this.tree, x: this.x, y: this.y } )
    })
  }
  , render( h ){
    this.node.move( this.x, this.y ).front()
    this.label.plain( `${this.tree.lineage.length}` )
    return this.node
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
    font-size: 20px
    text-anchor: middle
    alignment-baseline: middle
    fill: #333
    transition: fill 0.15s linear

  &:hover circle
    fill: #1b7abf
    stroke: #1b7abf

  &:hover text
    fill: #ffffff
</style>
