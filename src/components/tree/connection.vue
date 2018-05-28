<script>
function drawConnection( scene, x1, y1, x2, y2 ){
  const spacing = 40
  return scene.polyline([
    [ x1, y1 ]
    , [ x1, y1 + spacing ]
    , [ x2, y1 + spacing ]
    , [ x2, y2 ]
  ]).addClass('svg-connection')
}

export default {
  name: 'Connection'
  , inject: [ 'provider' ]
  , props: [ 'from', 'to' ]
  , data: () => ({

  })
  , render( h ){
    if ( !this.provider.svg ){ return }
    let scene = this.provider.svg

    drawConnection( scene, this.from[0], this.from[1], this.to[0], this.to[1] )
    return null
  }
}
</script>

<style lang="sass">
.svg-connection
  fill: none
  stroke-width: 2
  stroke: #aaa
</style>
