<script>
// import VueMixinTween from 'vue-mixin-tween'
// import TWEEN from '@tweenjs/tween.js'
export default {
  name: 'Connection'
  , inject: [ 'svg' ]
  , props: [ 'x1', 'y1', 'x2', 'y2', 'padding', 'horizontal' ]
  , data: () => ({
  })
  , mixins: [
    // VueMixinTween('x1', 700, TWEEN.Easing.Quadratic.InOut)
    // , VueMixinTween('y1', 700, TWEEN.Easing.Quadratic.InOut)
    // , VueMixinTween('x2', 700, TWEEN.Easing.Quadratic.InOut)
    // , VueMixinTween('y2', 700, TWEEN.Easing.Quadratic.InOut)
  ]
  , beforeDestroy(){
    this.node.remove()
  }
  , beforeMount(){
    let scene = this.svg
    this.node = scene.polyline([]).addClass('svg-connection')
  }
  , render( h ){
    this.plot()
    return this.node
  }
  , methods: {
    plot(){
      let spacing = this.padding
      let x1 = this.x1
      let y1 = this.y1
      let x2 = this.x2
      let y2 = this.y2
      let line

      if ( this.horizontal ){
        line = [
          [ x1, y1 ]
          , [ x1 + spacing, y1 ]
          , [ x1 + spacing, y2 ]
          , [ x2, y2 ]
        ]
      } else {
        line = [
          [ x1, y1 ]
          , [ x1, y1 + spacing ]
          , [ x2, y1 + spacing ]
          , [ x2, y2 ]
        ]
      }

      this.node.plot( line ).back()
    }
  }
}
</script>

<style lang="sass">
@import '@/styles/_variables.scss'
.svg-connection
  fill: none
  stroke-width: 3
  stroke: hsl(208, 40%, 75%)
  -moz-shape-rendering: cripsedges
  shape-rendering: cripsedges
</style>
