<script>
const spacing = 40
export default {
  name: 'Connection'
  , inject: [ 'svg' ]
  , props: [ 'from', 'to' ]
  , data: () => ({
  })
  , beforeDestroy(){
    this.node.remove()
  }
  , render( h ){
    let scene = this.svg
    if ( !this.node ){
      this.node = scene.polyline([]).addClass('svg-connection')
    }

    this.plot()
    return this.node
  }
  , methods: {
    plot(){
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
.svg-connection
  fill: none
  stroke-width: 2
  stroke: #aaa
</style>
