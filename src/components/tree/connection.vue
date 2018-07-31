<script>
export default {
  name: 'Connection'
  , inject: [ 'svg' ]
  , props: [ 'from', 'to', 'padding' ]
  , data: () => ({
  })
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
      let x1 = this.from[0]
      let y1 = this.from[1]
      let x2 = this.to[0]
      let y2 = this.to[1]

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
