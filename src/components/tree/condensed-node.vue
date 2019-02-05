<script>
import { getTxnInfo, isMRCA } from '@/lib/taxonomy'
export default {
  name: 'CondensedNode'
  // , functional: true
  , inject: [ 'svg' ]
  , props: [ 'leaf', 'x', 'y', 'horizontal' ]
  , data: () => ({
    txnInfo: null
    , otherCommonNames: []
    , loading: false
  })
  , watch: {
    leaf: {
      handler( leaf ){
        if ( !leaf ){ return }

        getTxnInfo( leaf, { images: false } ).then( info => {
          this.txnInfo = info
          this.otherCommonNames = info.commonName
        }).catch( ( err ) => this.$emit('error', err) )
      }
      , immediate: true
    }
  }
  , computed: {
    commonName(){
      if ( this.isMRCA ){ return '' }
      if ( !this.txnInfo || !this.txnInfo.vernacularNameList ){
        if ( this.otherCommonNames ){
          return this.otherCommonNames[0] || ''
        }
        return ''
      }
      return this.txnInfo.vernacularNameList
    }
    , scientificName(){
      if ( !this.txnInfo ){ return '' }
      return this.txnInfo.canonicalName ||
        this.txnInfo.name ||
        this.leaf.node_id || ''
    }
    , isMRCA(){
      return this.leaf && isMRCA(this.leaf)
    }
  }
  , beforeDestroy(){
    this.node.off( 'click' )
    this.node.remove()
  }
  , beforeMount(){
    let scene = this.svg
    this.node = scene.group().addClass('svg-condensed-node').move( 0, 0 )

    this.node.circle(10).center(0, 0)

    this.label = this.node.plain( '...' )

    this.node.on( 'click', (e) => {
      e.stopPropagation()
      this.$emit( 'click', { leaf: this.leaf, x: this.x, y: this.y } )
    })
  }
  , render( h ){
    // this.node.move( this.xTween, this.yTween ).front()
    this.node.style( 'transform', `translate3d(${this.x}px, ${this.y}px, 0)`).front()
    if ( this.horizontal ){
      this.label.removeClass('vertical')
    } else {
      this.label.addClass('vertical')
    }
    if ( this.commonName ){
      this.label.plain( `${this.commonName}` )
    } else {
      this.label.plain( `(${this.scientificName})` )
    }
    return this.node
  }
}
</script>

<style lang="sass">
@import '@/styles/_variables.scss'
.svg-condensed-node
  cursor: zoom-in
  transition: transform 0.7s ease-in-out
  circle
    fill: desaturate(lighten($blue, 20), 50)
    // stroke: white
    transition: all 0.15s linear

  text
    font-family: $family-monospace
    font-size: 16px
    text-anchor: left
    dominant-baseline: middle
    fill: darken($blue, 15)
    transition: fill 0.15s linear

    transform: translateX(12px)

    &.vertical
      transform: rotateZ(90deg) translateX(12px)
</style>
