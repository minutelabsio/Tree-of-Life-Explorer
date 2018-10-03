<script>
// import VueMixinTween from 'vue-mixin-tween'
// import TWEEN from '@tweenjs/tween.js'
export default {
  name: 'Node'
  // , functional: true
  , inject: [ 'svg' ]
  , props: [ 'tree', 'x', 'y' ]
  , data: () => ({

  })
  , mixins: [
    // VueMixinTween('x', 700, TWEEN.Easing.Quadratic.InOut)
    // , VueMixinTween('y', 700, TWEEN.Easing.Quadratic.InOut)
  ]
  , beforeDestroy(){
    this.node.off( 'click' )
    this.node.remove()
  }
  , beforeMount(){
    let nodeWidth = 36
    let scene = this.svg
    this.node = scene.group().addClass('svg-node').move( 0, 0 )
    this.node.rect(nodeWidth, nodeWidth).center(0, 0).radius(7)

    this.label = this.node.plain( `${this.tree.lineage.length}` ).attr('y', 2)

    this.node.on( 'click', (e) => {
      e.stopPropagation()
      this.$emit( 'click', { subtree: this.tree, x: this.x, y: this.y } )
    })
  }
  , render( h ){
    // this.node.move( this.xTween, this.yTween ).front()
    this.node.style( 'transform', `translate3d(${this.x}px, ${this.y}px, 0)`).front()
    this.label.plain( `${this.tree.lineage.length}` )
    return this.node
  }
}
</script>

<style lang="sass">
@import '@/styles/_variables.scss'
.svg-node
  cursor: pointer
  transition: transform 0.7s ease-in-out
  rect
    fill: desaturate(lighten($blue, 20), 50)
    transition: all 0.15s linear

  // circle
  //   fill: $white
  //   stroke-width: 2
  //   stroke: $grey-light
  //   transition: all 0.15s linear

  text
    font-size: 20px
    text-anchor: middle
    alignment-baseline: middle
    fill: $white
    transition: fill 0.15s linear

  &:hover rect
    fill: $blue

  &:hover text
    fill: $white
</style>
