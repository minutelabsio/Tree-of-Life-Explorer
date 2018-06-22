<script>
export default {
  name: 'Node'
  // , functional: true
  , inject: [ 'svg' ]
  , props: [ 'node', 'x', 'y' ]
  , data: () => ({

  })
  , beforeDestroy(){
    this.tail.off( 'click' )
    this.tail.remove()
  }
  , beforeMount(){
    let tailRadius = 15
    let scene = this.svg
    this.tail = scene.group().addClass('svg-tail').move( this.x, this.y )
    this.tail.circle(2 * tailRadius).center(0, 0)

    // this.label = this.tail.plain( `${this.tree.lineage.length}` ).attr('y', 2)

    this.tail.on( 'click', (e) => {
      e.stopPropagation()
      this.$emit( 'click', { tail: this.tail, node: this.node, x: this.x, y: this.y } )
    })
  }
  , render( h ){
    this.tail.move( this.x, this.y ).front()
    // this.label.plain( `${this.tree.lineage.length}` )
    return this.tail
  }
}
</script>

<style lang="sass">
.svg-tail
  cursor: pointer

  circle
    fill: #eee
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
