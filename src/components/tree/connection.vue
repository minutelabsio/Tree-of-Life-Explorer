<script>
// import VueMixinTween from 'vue-mixin-tween'
// import TWEEN from '@tweenjs/tween.js'
export default {
  name: 'Connection'
  , inject: [ 'svg' ]
  , props: [ 'x1', 'y1', 'x2', 'y2', 'padding' ]
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
      let spacing = this.padding || 40
      let x1 = this.x1
      let y1 = this.y1
      let x2 = this.x2
      let y2 = this.y2

      this.node.plot([
        [ x1, y1 ]
        , [ x1, y1 + spacing ]
        , [ x2, y1 + spacing ]
        , [ x2, y2 ]
      ]).back()
    }
  }
}
</script>

<style lang="sass">
@import '@/styles/_variables.scss'
.svg-connection
  fill: none
  stroke-width: 2
  stroke: $grey-light
</style>
