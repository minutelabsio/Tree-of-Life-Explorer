<script>
const width = 40
const thickness = 40
export default {
  name: 'AncestorCollapse'
  , inject: [ 'svg' ]
  , props: [ 'tree', 'x', 'y', 'horizontal' ]
  , data: () => ({

  })
  , watch: {
    horizontal: 'drawDots'
  }
  , beforeDestroy(){
    this.node.off( 'click' )
    this.node.remove()
  }
  , beforeMount(){
    let scene = this.svg
    this.node = scene.group().addClass('svg-ancestor-collapse').move( 0, 0 )

    this.node.rect(width, thickness).center(0, 0).radius( 7 )

    this.dots = this.node.group()
    this.drawDots()

    this.label = this.node.plain( `${this.tree.lineage.length}` )

    this.node.on( 'click', (e) => {
      e.stopPropagation()
      this.$emit( 'click', { subtree: this.tree, x: this.x, y: this.y } )
    })
  }
  , methods: {
    drawDots(){
      this.dots.clear()
      if ( this.horizontal ){
        this.dots.circle(3).center(width / 5, 0)
        this.dots.circle(3).center(0, 0)
        this.dots.circle(3).center(-width / 5, 0)
      } else {
        this.dots.circle(3).center(0, width / 5)
        this.dots.circle(3).center(0, 0)
        this.dots.circle(3).center(0, -width / 5)
      }
    }
  }
  , render( h ){
    this.node.data( 'ott', this.tree.leaf.node_id )

    if ( this.horizontal ){
      this.node.addClass('horizontal')
    } else {
      this.node.removeClass('horizontal')
    }

    this.node.style( 'transform', `translate3d(${this.x}px, ${this.y}px, 0)`).front()

    if ( this.horizontal ){
      this.label.attr('x', 0).attr('y', -14)
    } else {
      this.label.attr('x', -10).attr('y', 1.5)
    }

    this.label.plain( `${this.tree.lineage.length}` )
    return this.node
  }
}
</script>

<style lang="sass">
@import '@/styles/_variables.scss'
$mutedBlue: desaturate(lighten($blue, 20), 50)
.svg-ancestor-collapse
  cursor: pointer
  // transition: transform 0.7s ease-in-out
  rect
    fill: white
    stroke: white
    transition: all 0.15s linear

  circle
    fill: $mutedBlue

  // circle
  //   fill: $white
  //   stroke-width: 2
  //   stroke: $grey-light
  //   transition: all 0.15s linear

  text
    font-size: 16px
    text-anchor: end
    dominant-baseline: middle
    fill: $mutedBlue
    transition: fill 0.15s linear

  &.horizontal text
    text-anchor: middle

  &:hover circle
    fill: $blue

  &:hover text
    fill: $blue
</style>
